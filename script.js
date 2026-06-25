const formTarefa = document.getElementById('form-tarefa');
const inputTarefa = document.getElementById('input-tarefa');
const selectPrioridade = document.getElementById('select-prioridade');
const selectCategoria = document.getElementById('select-categoria');
const inputData = document.getElementById('input-data');
const inputBusca = document.getElementById('input-busca');
const listaTarefas = document.getElementById('lista-tarefas');
const btnTema = document.getElementById('btn-tema');
const btnLimparTudo = document.getElementById('btn-limpar-tudo');
const contadorTarefas = document.getElementById('contador-tarefas');
const barraProgressoFill = document.getElementById('barra-progresso-fill');
const mensagemVazia = document.getElementById('mensagem-vazia');
const botoesFiltro = document.querySelectorAll('.btn-filtro');

// ELEMENTOS DA CALCULADORA E DO MODAL
const btnCalc = document.getElementById('btn-calc');
const modalCalc = document.getElementById('modal-calc');
const fecharModal = document.querySelector('.fechar-modal');
const calcDisplay = document.getElementById('calc-display');

let tarefas = JSON.parse(localStorage.getItem('tarefas-master')) || [];
let filtroAtual = 'todas';
let termoBusca = '';

function renderizarTarefas() {
    listaTarefas.innerHTML = '';
    const hoje = new Date().toLocaleDateString('en-CA');

    let tarefasFiltradas = tarefas.filter(tarefa => {
        const passaStatus = filtroAtual === 'todas' || (filtroAtual === 'pendentes' && !tarefa.concluida) || (filtroAtual === 'concluidas' && tarefa.concluida);
        const passaBusca = tarefa.texto.toLowerCase().includes(termoBusca.toLowerCase());
        return passaStatus && passaBusca;
    });

    tarefasFiltradas.forEach((tarefa) => {
        const li = document.createElement('li');
        li.classList.add('tarefa-item', `prio-${tarefa.prioridade}`);
        
        const estaAtrasada = tarefa.dataLimite && tarefa.dataLimite < hoje && !tarefa.concluida;
        if (estaAtrasada) li.classList.add('atrasada');
        if (tarefa.concluida) li.classList.add('concluida');

        let dataFormatada = '';
        if (tarefa.dataLimite) {
            const [ano, mes, dia] = tarefa.dataLimite.split('-');
            dataFormatada = `📅 ${dia}/${mes}/${ano}`;
        }

        const span = document.createElement('span');
        span.classList.add('tarefa-texto');
        span.innerHTML = `
            <div>${tarefa.texto}</div>
            <div class="tarefa-detalhes">
                <span>${tarefa.categoria}</span>
                ${dataFormatada ? `<span>${dataFormatada}</span>` : ''}
                ${estaAtrasada ? `<span class="tag-atrasada">⚠️ Atrasada!</span>` : ''}
            </div>
        `;
        
        span.addEventListener('click', () => {
            tarefas = tarefas.map(t => t.id === tarefa.id ? { ...t, concluida: !t.concluida } : t);
            renderizarTarefas();
        });

        span.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const novoTexto = prompt("Editar tarefa:", tarefa.texto);
            if (novoTexto !== null && novoTexto.trim() !== "") {
                tarefas = tarefas.map(t => t.id === tarefa.id ? { ...t, texto: novoTexto.trim() } : t);
                renderizarTarefas();
            }
        });

        const btnDeletar = document.createElement('button');
        btnDeletar.classList.add('btn-deletar');
        btnDeletar.innerHTML = '🗑️';
        btnDeletar.addEventListener('click', () => {
            tarefas = tarefas.filter(t => t.id !== tarefa.id);
            renderizarTarefas();
        });

        li.appendChild(span);
        li.appendChild(btnDeletar);
        listaTarefas.appendChild(li);
    });

    const totalReal = tarefas.length;
    const totalFiltrado = tarefasFiltradas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;

    contadorTarefas.innerText = `${concluidas} de ${totalReal} tarefas concluídas`;
    const porcentagem = totalReal === 0 ? 0 : (concluidas / totalReal) * 100;
    barraProgressoFill.style.width = `${porcentagem}%`;

    btnLimparTudo.style.display = totalReal === 0 ? 'none' : 'block';
    mensagemVazia.style.display = totalFiltrado === 0 ? 'block' : 'none';
    
    if (totalReal > 0 && totalFiltrado === 0) {
        mensagemVazia.innerText = "Nenhuma tarefa corresponde à sua busca... 🔍";
    } else {
        mensagemVazia.innerText = "Tudo limpo por aqui! Hora de descansar? ☕";
    }

    localStorage.setItem('tarefas-master', JSON.stringify(tarefas));
}

// ADICIONAR TAREFA
formTarefa.addEventListener('submit', (event) => {
    event.preventDefault();
    const textoTarefa = inputTarefa.value.trim();
    if (textoTarefa === '') return;

    const novaTarefa = {
        id: Date.now(),
        texto: textoTarefa,
        prioridade: selectPrioridade.value,
        categoria: selectCategoria.value,
        dataLimite: inputData.value,
        concluida: false
    };

    tarefas.push(novaTarefa);
    inputTarefa.value = '';
    selectPrioridade.value = 'media';
    selectCategoria.value = '💻 Trabalho';
    inputData.value = '';
    renderizarTarefas();
});

inputBusca.addEventListener('input', (e) => {
    termoBusca = e.target.value;
    renderizarTarefas();
});

btnLimparTudo.addEventListener('click', () => {
    if (tarefas.length === 0) return;
    if (confirm("Apagar todas as tarefas permanentemente?")) {
        tarefas = [];
        renderizarTarefas();
    }
});

botoesFiltro.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesFiltro.forEach(b => b.classList.remove('ativo'));
        botao.classList.add('ativo');
        filtroAtual = botao.getAttribute('data-filtro');
        renderizarTarefas();
    });
});

// MODO ESCURO
if (localStorage.getItem('tema-gerenciador') === 'dark') {
    document.body.classList.add('dark');
    btnTema.innerText = '☀️';
}
btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const eDark = document.body.classList.contains('dark');
    localStorage.setItem('tema-gerenciador', eDark ? 'dark' : 'light');
    btnTema.innerText = eDark ? '☀️' : '🌙';
});


// ==========================================
// CONTROLE DO MODAL DA CALCULADORA
// ==========================================
btnCalc.addEventListener('click', () => {
    modalCalc.style.display = 'flex'; // Abre o modal centralizado
});

fecharModal.addEventListener('click', () => {
    modalCalc.style.display = 'none'; // Fecha no X
});

// Fecha o modal se clicar fora da caixinha da calculadora
window.addEventListener('click', (e) => {
    if (e.target === modalCalc) {
        modalCalc.style.display = 'none';
    }
});

// ==========================================
// LÓGICA INTERNA DA CALCULADORA
// ==========================================
function inserirCalc(valor) {
    if (calcDisplay.value === '0' && valor !== '.') {
        calcDisplay.value = valor;
    } else {
        calcDisplay.value += valor;
    }
}

function limparCalc() {
    calcDisplay.value = '0';
}

function apagarUltimoCalc() {
    let expressao = calcDisplay.value;
    if (expressao.length > 1) {
        calcDisplay.value = expressao.substring(0, expressao.length - 1);
    } else {
        calcDisplay.value = '0';
    }
}

function calcularResultado() {
    try {
        // Remove qualquer caractere malicioso por segurança antes de rodar o cálculo
        const expressaoLimpa = calcDisplay.value.replace(/[^0-9+\-*/.]/g, '');
        
        if (expressaoLimpa) {
            // Executa a string matemática de forma segura usando o construtor Function
            const resultado = new Function(`return ${expressaoLimpa}`)();
            
            // Corrige dízimas longas como 0.1 + 0.2 dando 0.300000004
            calcDisplay.value = Number(resultado.toFixed(4)); 
        }
    } catch (error) {
        calcDisplay.value = 'Erro';
        setTimeout(limparCalc, 1500); // Se der erro, avisa e limpa após 1.5s
    }
}

renderizarTarefas();