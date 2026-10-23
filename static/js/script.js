const formulario = document.querySelector("#form-produto");
const listaProdutos = document.querySelector("#lista-produtos");
const mensagem = document.querySelector("#mensagem");
const botaoAtualizar = document.querySelector("#atualizar");

// GET: consulta os produtos da API.
async function listarProdutos() {
    listaProdutos.innerHTML = "<p>Carregando produtos...</p>";
    try {
        const resposta = await fetch("/produtos");
        if (!resposta.ok) throw new Error("Não foi possível buscar os produtos.");
        const produtos = await resposta.json();
        listaProdutos.innerHTML = "";

        if (produtos.length === 0) {
            listaProdutos.innerHTML = "<p>Nenhuma planta cadastrada ainda.</p>";
            return;
        }

        produtos.forEach((produto) => {
            const cartao = document.createElement("article");
            cartao.className = "produto";
            const nome = document.createElement("h3");
            nome.textContent = produto.nome;
            const categoria = document.createElement("p");
            categoria.textContent = produto.categoria;
            const preco = document.createElement("strong");
            preco.textContent = Number(produto.preco).toLocaleString("pt-BR", {
                style: "currency", currency: "BRL"
            });
            cartao.append(nome, categoria, preco);
            listaProdutos.appendChild(cartao);
        });
    } catch (erro) {
        listaProdutos.innerHTML = "<p>Erro ao carregar. Confira se a API Flask está ligada.</p>";
        console.error(erro);
    }
}

// POST: envia o formulário em JSON e atualiza a lista sem recarregar.
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensagem.textContent = "Cadastrando...";
    const dados = {
        nome: document.querySelector("#nome").value.trim(),
        preco: Number(document.querySelector("#preco").value),
        categoria: document.querySelector("#categoria").value.trim()
    };

    try {
        const resposta = await fetch("/produtos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.erro || "Falha no cadastro.");
        mensagem.textContent = resultado.mensagem;
        formulario.reset();
        await listarProdutos();
    } catch (erro) {
        mensagem.textContent = erro.message || "Erro ao cadastrar o produto.";
        console.error(erro);
    }
});

botaoAtualizar.addEventListener("click", listarProdutos);
listarProdutos();
