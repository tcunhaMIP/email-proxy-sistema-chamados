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
    // chama a API do Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`, // variavel ambiente na Vercel
      },
      // dados
      body: JSON.stringify({
        from: "Sistema de Chamados <thiago.cunha@mipconstrutora.com.br>",
        to: ["ti@mipconstrutora.com.br"],
        subject: `Novo Chamado de ${data.nomeFunc}`,
        html: `<p>Novo Chamado recebido:<br><br>Nome do Funcionário: ${data.nomeFunc}<br>Departamento: ${data.depFunc}<br>Problema: ${data.problemaFunc}<br>Descrição: ${data.desc}<br></p>`,
      }),
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
