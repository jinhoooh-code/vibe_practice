// 팀 일정 현황판 스크립트
// data/schedule.json을 읽어 기한이 빠른 순서로 #schedule-body에 행을 채운다.

const tableBody = document.getElementById("schedule-body");
const ownerFilter = document.getElementById("owner-filter");

// 지연 판단 기준일. 기한이 이 날짜보다 앞서고 완료가 아니면 지연으로 표시한다.
const BASE_DATE = "2026-06-15";

let allItems = [];

// 기한 오름차순, 기한이 같으면 id 오름차순
function sortByDue(items) {
  return [...items].sort((a, b) => a.due.localeCompare(b.due) || a.id - b.id);
}

function isDelayed(item) {
  return item.due < BASE_DATE && item.status !== "완료";
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
    if (item.status === "완료") {
      row.classList.add("done");
    }
    if (isDelayed(item)) {
      row.classList.add("delayed");
      const badge = document.createElement("span");
      badge.className = "badge-delayed";
      badge.textContent = "지연";
      row.lastElementChild.append(" ", badge);
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

// 선택한 담당자의 일정만 보여 준다. 값이 비어 있으면 전체.
function applyFilter() {
  const owner = ownerFilter.value;
  const items = owner ? allItems.filter((item) => item.owner === owner) : allItems;
  if (items.length === 0) {
    renderMessage("해당 담당자의 일정이 없습니다.");
    return;
  }
  renderRows(items);
}

async function loadSchedule() {
  try {
    // 데이터 파일을 고친 뒤 새로고침하면 바로 반영되도록 캐시를 쓰지 않는다.
    const response = await fetch("data/schedule.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    allItems = sortByDue(data.items);
    applyFilter();
  } catch (error) {
    console.error(error);
    renderMessage("일정 데이터를 불러오지 못했습니다.");
  }
}

ownerFilter.addEventListener("change", applyFilter);

loadSchedule();
