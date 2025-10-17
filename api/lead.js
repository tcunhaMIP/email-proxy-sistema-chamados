export default async function handler(req, res) {
  // Sempre permita CORS para qualquer origem (ambiente de desenvolvimento)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, token"
  );

  // Responde imediatamente ao preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Somente POST permitido" });
  }

  let data = req.body;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return res.status(400).json({ error: "Body inválido, não é JSON" });
    }
  }

  // -----------------------------------------------------------------------------------------------------------

  try {
    let body;
    if (data.title != null) {
      body = JSON.stringify({
        from: "Sistema de Chamados <thiago.cunha@mipconstrutora.com.br>",
        to: ["ti@mipconstrutora.com.br"],
        subject: `${data.title} de ${data.nomeFunc}`,
        html: `<p>Novo Chamado recebido${
          data.dataIncidente ? ` - Incidente de Segurança` : ``
        }:<br><br>Nome do Funcionário: ${data.nomeFunc}<br>Departamento: ${
          data.depFunc
        }<br>Problema: ${data.problemaFunc}<br>Descrição: ${data.desc}<br>${
          data.contato && String(data.contato).trim().length > 0
            ? `<br>Preferência de contato: ${data.contato}`
            : ""
        }<br>Grau de Criticidade: ${data.criticidade}<br>${
          data.dataIncidente
            ? `<br>Data do Incidente: ${data.dataIncidente} <br>`
            : ""
        }
        <br>
        Clique <a href="https://mipconstrutora.com.br/ti/sistema-chamados/#/ti/todos-chamados">aqui</a> para visualizar!
        </p>`,
      });
    } else if (data.emailFunc != null) {
      body = JSON.stringify({
        from: "Sistema de Chamados <thiago.cunha@mipconstrutora.com.br>",
        to: [data.emailFunc],
        subject: "Seu chamado foi concluído!",
        html: `<p>
                  Resolução do chamado: "${data.resolucao}"<br><br>
              </p>
              <p>Avalie ${data.nomeMembroTI} por seu atendimento:<br>
                  <a href="https://mipconstrutora.com.br/ti/sistema-chamados/#/avaliar-membro?idMembro=${data.idMembro}&idChamado=${data.idChamado}">Clique aqui para avaliar</a>
              </p>`,
      });
    } else if (data.solicitante != null) {
      body = JSON.stringify({
        from: "Sistema de Chamados <thiago.cunha@mipconstrutora.com.br>",
        to: ["ti@mipconstrutora.com.br"],
        subject: "Chamado de Solicitação de Recursos",
        html: `
            <p>
              Novo Chamado de Solicitação de Recursos recebido de ${data.solicitante}
            </p>
            <br>
            <p>
              Clique <a href="https://mipconstrutora.com.br/ti/sistema-chamados/#/ti/solicitacao-recursos">aqui</a> para verificar o chamado!
            </p>
        `,
      });
    } else {
      return res
        .status(400)
        .json({ error: "Body deve conter 'title' ou 'email_funcionario'" });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body,
    });

    // checa resposta
    const respData = await response.json();
    if (!response.ok) {
      return res
        .status(500)
        .json({ error: "Erro ao enviar e-mail", detalhes: respData });
    }

    res.status(200).json({ success: true, dados: respData });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao enviar e-mail", detalhes: error.message });
  }
}
