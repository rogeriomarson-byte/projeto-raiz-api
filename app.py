from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

BANCO = "raiz.db"


def conectar_banco():
    conexao = sqlite3.connect(BANCO)
    conexao.row_factory = sqlite3.Row
    return conexao


def criar_tabela():
    conexao = conectar_banco()
    conexao.execute(
        """CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            categoria TEXT NOT NULL
        )"""
    )
    conexao.commit()
    conexao.close()


@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/produtos", methods=["GET"])
def listar_produtos():
    conexao = conectar_banco()
    produtos = conexao.execute(
        "SELECT id, nome, preco, categoria FROM produtos ORDER BY id DESC"
    ).fetchall()
    conexao.close()
    return jsonify([dict(produto) for produto in produtos])


@app.route("/produtos", methods=["POST"])
def cadastrar_produto():
    dados = request.get_json(silent=True)
    if not dados:
        return jsonify({"erro": "Envie os dados em formato JSON."}), 400

    nome = str(dados.get("nome", "")).strip()
    categoria = str(dados.get("categoria", "")).strip()
    try:
        preco = float(dados.get("preco", 0))
    except (TypeError, ValueError):
        return jsonify({"erro": "O preço precisa ser um número."}), 400

    if not nome or not categoria or preco <= 0:
        return jsonify({"erro": "Preencha os campos e informe um preço maior que zero."}), 400

    conexao = conectar_banco()
    cursor = conexao.execute(
        "INSERT INTO produtos (nome, preco, categoria) VALUES (?, ?, ?)",
        (nome, preco, categoria),
    )
    conexao.commit()
    produto_id = cursor.lastrowid
    conexao.close()

    return jsonify({
        "mensagem": "Produto cadastrado com sucesso!",
        "produto": {
            "id": produto_id,
            "nome": nome,
            "preco": preco,
            "categoria": categoria,
        },
    }), 201


if __name__ == "__main__":
    criar_tabela()
    app.run(debug=True)
