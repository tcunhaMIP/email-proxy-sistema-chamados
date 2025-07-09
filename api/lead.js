export default async function handler(req, res) {
  // Origens permitidas para recebimento de chamadas API
  const allowedOrigins = [
    "https://jardins156.com.br",
    "https://www.jardins156.com.br",
    "https://mipconstrutora.com.br",
    "https://www.mipconstrutora.com.br",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
  ];

  // processos de verificacao
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, token");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
        from: "Thiago Cunha <thiago.cunha@mipconstrutora.com.br>",
        to: ["gustavo.rodrigues@mipconstrutora.com.br"],
        subject: "Novo Lead do Site",
        html: `<p>Novo lead recebido:<br>Nome: ${data.nome}<br>Email: ${data.email}<br>Telefone: ${data.telefone}<br></p>`,
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
