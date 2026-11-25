const STORAGE_KEY = "lista_compras_mes_v1";

const formItem = document.getElementById("form-item");
const inputNome = document.getElementById("input-nome");
const inputQtd = document.getElementById("input-qtd");
const selectCategoria = document.getElementById("select-categoria");
const listaEl = document.getElementById("lista-compras");
const resumoEl = document.getElementById("resumo");
const btnLimparComprados = document.getElementById("btn-limpar-comprados");
const botoesFiltro = document.querySelectorAll(".filtro");

let itens = carregarItens();
let filtroAtual = "todos";

function carregarItens() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

function salvarItens() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
}

function atualizarResumo() {
  const total = itens.length;
  const comprados = itens.filter((item) => item.comprado).length;
  resumoEl.textContent = `${comprados} de ${total} ${total === 1 ? "item comprado" : "itens comprados"}`;
}

function renderizar() {
  atualizarResumo();

  const filtrados = itens.filter((item) => {
    if (filtroAtual === "pendentes") return !item.comprado;
    if (filtroAtual === "comprados") return item.comprado;
    return true;
  });

  listaEl.innerHTML = "";

  if (filtrados.length === 0) {
    listaEl.innerHTML = `<li class="vazio">Nenhum item por aqui. Adicione algo à sua lista!</li>`;
    return;
  }

  filtrados.forEach((item) => {
    const li = document.createElement("li");
    li.className = `item ${item.comprado ? "comprado" : ""}`;

    const principal = document.createElement("div");
    principal.className = "item-principal";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.comprado;
    checkbox.addEventListener("change", () => alternarComprado(item.id));

    const info = document.createElement("div");
    info.className = "item-info";

    const nome = document.createElement("span");
    nome.className = "item-nome";
    nome.textContent = item.nome;

    const meta = document.createElement("span");
    meta.className = "item-meta";
    meta.textContent = `Qtd: ${item.quantidade} • ${item.categoria}`;

    info.append(nome, meta);
    principal.append(checkbox, info);

    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.className = "btn-remover";
    btnRemover.title = "Remover item";
    btnRemover.textContent = "✕";
    btnRemover.addEventListener("click", () => removerItem(item.id));

    li.append(principal, btnRemover);
    listaEl.appendChild(li);
  });
}

function adicionarItem(event) {
  event.preventDefault();

  const nome = inputNome.value.trim();
  const quantidade = Number(inputQtd.value) || 1;
  const categoria = selectCategoria.value;

  if (!nome) return;

  itens.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    nome,
    quantidade,
    categoria,
    comprado: false,
  });

  salvarItens();
  renderizar();

  formItem.reset();
  inputQtd.value = 1;
  inputNome.focus();
}

function alternarComprado(id) {
  itens = itens.map((item) =>
    item.id === id ? { ...item, comprado: !item.comprado } : item
  );
  salvarItens();
  renderizar();
}

function removerItem(id) {
  itens = itens.filter((item) => item.id !== id);
  salvarItens();
  renderizar();
}

function limparComprados() {
  itens = itens.filter((item) => !item.comprado);
  salvarItens();
  renderizar();
}

botoesFiltro.forEach((btn) => {
  btn.addEventListener("click", () => {
    botoesFiltro.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filtroAtual = btn.dataset.filtro;
    renderizar();
  });
});

formItem.addEventListener("submit", adicionarItem);
btnLimparComprados.addEventListener("click", limparComprados);

renderizar();