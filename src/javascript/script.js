let selectedColumn = null;

let kanbanData = JSON.parse(localStorage.getItem('kanbanData')) || {columns:[]}

document.querySelectorAll('.add-card').forEach(button => {
    button.addEventListener('click', (event) => {
        selectedColumn = event.currentTarget.closest('.kanban-column').querySelector('.kanban-cards');
        document.getElementById('customPrompt').style.display = 'block';
    });
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('customPrompt').style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('customPrompt')) {
        document.getElementById('customPrompt').style.display = 'none';
    }
});

document.getElementById('confirm-button').addEventListener('click', () => {
    const taskDescription = document.getElementById('task-input').value;
    const priorityDescription = document.getElementById('prioried-input').value;

    if (taskDescription && priorityDescription) {
        if (selectedColumn) {
            const uniqueCardId = Date.now().toString(); // Gera um ID único para o cartão
            const columnId = selectedColumn.closest('.kanban-column').getAttribute('data-id'); // Obtém o ID da coluna

            const newCard = createCard(taskDescription, priorityDescription, uniqueCardId, columnId);
            selectedColumn.appendChild(newCard);

            // Atualizar o kanbanData com o novo cartão
            const columnIndex = kanbanData.columns.findIndex(col => col.id === columnId);
            if (columnIndex !== -1) {
                kanbanData.columns[columnIndex].cards.push({
                    id: uniqueCardId,
                    content: taskDescription,
                    priority: priorityDescription
                });
                localStorage.setItem('kanbanData', JSON.stringify(kanbanData)); // Atualiza o localStorage
            }
        }
        document.getElementById('task-input').value = '';
        document.getElementById('prioried-input').value = '';
        document.getElementById('customPrompt').style.display = 'none';
    } else {
        alert('Por favor, digite uma descrição para a tarefa.');
    }
});

function createCard(content, priority, cardId = Date.now().toString(), columnId) {
    const card = document.createElement('div');
    card.classList.add('kanban-card');
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', cardId);
    card.setAttribute('data-column-id', columnId); // Define o ID da coluna no card

    card.innerHTML = `
        <div class="handle-card"> 
            <div class="badge high">
                <span>${priority}</span>
            </div>
        </div>
        <p class="card-title">${content}</p>
        <i class="fa-solid fa-trash delete-card"></i>
    `;

    card.querySelector('.delete-card').addEventListener('click', () => {
        // Remover o card do localStorage também
        const currentColumnId = card.getAttribute('data-column-id');
        const currentColumn = kanbanData.columns.find(col => col.id === currentColumnId);
        currentColumn.cards = currentColumn.cards.filter(c => c.id !== cardId);
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));

        // Remover o card da interface
        card.remove();
    });

    card.addEventListener('dragstart', (e) => {
        e.currentTarget.classList.add('dragging');
    });

    card.addEventListener('dragend', (e) => {
        e.currentTarget.classList.remove('dragging');
    });

    return card;
}
document.querySelectorAll('.kanban-cards').forEach(column => {
    column.addEventListener('dragover', e => {
        e.preventDefault();
        e.currentTarget.classList.add('cards-hover');
    });

    column.addEventListener('dragleave', e => {
        e.currentTarget.classList.remove('cards-hover');
    });

    column.addEventListener('drop', e => {
        e.currentTarget.classList.remove('cards-hover');
        const dragCard = document.querySelector('.kanban-card.dragging');
        e.currentTarget.appendChild(dragCard);
    });
});

document.querySelectorAll('.delete-column').forEach(button => {
    button.addEventListener('click', (event) => {
        const column = event.currentTarget.closest('.kanban-column');
        if (column) {
            column.remove();
        }
    });
});

document.getElementById('confirm-creat-table').addEventListener('click', () => {
    const columnTitle = document.getElementById('add-column').value;

    if (columnTitle) {
        const uniqueId = Date.now().toString(); // Gera um ID único baseado no timestamp
        const newColumn = createColumn(columnTitle, [], uniqueId); // Cria a coluna com o ID único
        document.querySelector('.kanBan').appendChild(newColumn);

        // Atualizar o kanbanData com o ID único
        kanbanData.columns.push({ id: uniqueId, title: columnTitle, cards: [] });
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
    } else {
        alert('Por favor, digite um nome para sua tabela');
    }

    document.getElementById('add-column').value = ''; // Limpa o campo de input
});

function createColumn(titleColumn, cards = [], columnId) {
    const column = document.createElement('div');
    column.classList.add('kanban-column');
    column.setAttribute('data-id', columnId);
    column.innerHTML = `
        <div class="kanban-title">
            <h2>${titleColumn}</h2>
            <i class="fa-solid fa-plus icon-soma add-card"></i>
            <i class="fa-solid fa-trash delete-column"></i>
        </div>
        <div class="kanban-cards"></div> <!-- Área para os cartões -->
        <div class="resize-height"></div> <!-- Alça de redimensionamento de altura -->
        <div class="resize-handle"></div> <!-- Alça de redimensionamento de largura -->
    `;

    const cardsContainer = column.querySelector('.kanban-cards');


    cards.forEach(cardData => {
        const newCard = createCard(cardData.content, cardData.priority);
        cardsContainer.appendChild(newCard);
    });

    column.querySelector('.add-card').addEventListener('click', (event) => {
        selectedColumn = event.currentTarget.closest('.kanban-column').querySelector('.kanban-cards');
        document.getElementById('customPrompt').style.display = 'block';
    });


    column.querySelector('.delete-column').addEventListener('click', () => {
        const columnId = column.getAttribute('data-id');

      
        kanbanData.columns = kanbanData.columns.filter(col => col.id !== columnId);
        localStorage.setItem('kanbanData', JSON.stringify(kanbanData));

     
        column.remove();
    });

    cardsContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!e.target.closest('.resize-handle') && !e.target.closest('.resize-height')) {
            cardsContainer.classList.add('cards-hover');
        }
    });

    cardsContainer.addEventListener('dragleave', (e) => {
        cardsContainer.classList.remove('cards-hover');
    });

    cardsContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        cardsContainer.classList.remove('cards-hover');
        
        const draggedCard = document.querySelector('.kanban-card.dragging');
        if (draggedCard) {
            const currentColumnId = cardsContainer.closest('.kanban-column').getAttribute('data-id'); 
            const previousColumnId = draggedCard.getAttribute('data-column-id'); 
    
        
            cardsContainer.appendChild(draggedCard);
    
      
            const cardId = draggedCard.getAttribute('data-id');
            const cardContent = draggedCard.querySelector('.card-title').textContent;
            const cardPriority = draggedCard.querySelector('.badge span').textContent;
    
          
            const previousColumn = kanbanData.columns.find(col => col.id === previousColumnId);
            previousColumn.cards = previousColumn.cards.filter(card => card.id !== cardId);
    
        
            const newColumn = kanbanData.columns.find(col => col.id === currentColumnId);
            newColumn.cards.push({ id: cardId, content: cardContent, priority: cardPriority });
    
            
            draggedCard.setAttribute('data-column-id', currentColumnId);
    
        
            localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
        }
    });

    const handle = column.querySelector('.resize-handle');
    const handle2 = column.querySelector('.resize-height');

    if (handle) {
        handle.addEventListener('mousedown', startResize);
    }

    if (handle2) {
        handle2.addEventListener('mousedown', startResize);
    }

    return column;
}

// Carrega as colunas e cartões ao carregar a página
window.addEventListener('load', () => {
    const savedKanbanData = JSON.parse(localStorage.getItem('kanbanData'));
    if (savedKanbanData && savedKanbanData.columns) {
        kanbanData = savedKanbanData; // Atualiza o kanbanData global
        kanbanData.columns.forEach(columnData => {
            // Cria e renderiza a coluna sem salvar no localStorage novamente
            const newColumn = createColumn(columnData.title, [], columnData.id); 
            document.querySelector('.kanBan').appendChild(newColumn);

            // Recria os cartões para cada coluna, mas não salva novamente no localStorage
            const columnElement = document.querySelector(`.kanban-column[data-id="${columnData.id}"] .kanban-cards`);
            columnData.cards.forEach(cardData => {
                const newCard = createCard(cardData.content, cardData.priority, cardData.id, columnData.id);
                columnElement.appendChild(newCard);
            });
        });
    }
});



let currentColumn = null;
let startX = 0;
let startY = 0
let startWidth = 0;
let starkHeight = 0

document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', startResize);
});

document.querySelectorAll('.resize-height').forEach(handle => {
    handle.addEventListener('mousedown', startResize);
});

function startResize(event) {
    currentColumn = event.target.closest('.kanban-column');

    startX = event.clientX;
    startY = event.clientY;

    startWidth = parseInt(window.getComputedStyle(currentColumn).width, 10);
    starkHeight = parseInt(window.getComputedStyle(currentColumn).height, 10)

    document.addEventListener('mousemove', resizeColumn);
    document.addEventListener('mouseup', stopResize);
}

function resizeColumn(event) {
    if (currentColumn) {
        const newWidth = startWidth + (event.clientX - startX);
        const newHeight = starkHeight + (event.clientY - startY)

        if (newWidth > 250) {
            currentColumn.style.width = newWidth + 'px';
        }
        if (newHeight > 300) {
            currentColumn.style.height = newHeight + 'px';
        }
    }
}

function stopResize() {
    document.removeEventListener('mousemove', resizeColumn);
    document.removeEventListener('mouseup', stopResize);
    currentColumn = null;
}

