// 팀 일정 현황판 스크립트
// data/schedule.json을 읽어 기한이 빠른 순서로 #schedule-body에 행을 채운다.

const tableBody = document.getElementById("schedule-body");

// 기한 오름차순, 기한이 같으면 id 오름차순
function sortByDue(items) {
  return [...items].sort((a, b) => a.due.localeCompare(b.due) || a.id - b.id);
}

function renderRows(items) {
  tableBody.replaceChildren();
  for (const item of items) {
    const row = document.createElement("tr");
    for (const value of [item.task, item.owner, item.due, item.status]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  }
}

function renderMessage(text) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 4;
  cell.textContent = text;
  row.appendChild(cell);
  tableBody.replaceChildren(row);
}

async function loadSchedule() {
  try {
    const response = await fetch("data/schedule.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderRows(sortByDue(data.items));
  } catch (error) {
    console.error(error);
    renderMessage("일정 데이터를 불러오지 못했습니다.");
  }
}

loadSchedule();
