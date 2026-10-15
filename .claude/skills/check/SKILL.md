---
name: check
description: 팀 일정 현황판 화면을 브라우저에서 띄워 docs/요구사항.md의 완료 기준 4개와 화면 규칙(완료 행 회색, 375px 가로 스크롤 없음)을 확인하고 결과를 표로 보고한다. "화면 확인", "/check", 변경 후 동작 확인 요청에 사용.
---

# 화면 확인 (/check)

코드는 고치지 않는다. 확인하고 보고만 한다. 실패한 항목이 있으면 원인 추정과 함께 보고하고, 고칠지는 사용자에게 묻는다.

## 1. 서버 띄우기
- 내장 브라우저의 `preview_start`로 `.claude/launch.json`의 `public-static`을 띄운다 (포트 8000, 이미 떠 있으면 재사용).
- 브라우저 도구가 없으면 사용자에게 `python -m http.server 8000 --directory public`을 안내한다.

## 2. 넓은 화면에서 검사
캐시를 피하려고 `http://localhost:8000/?check=<현재 시각>`으로 이동한 뒤, 아래 스크립트를 `javascript_tool`로 실행한다.

```js
await new Promise(r => setTimeout(r, 500));
const BASE_DATE = "2026-06-15";
const filter = document.getElementById("owner-filter");
const rowsNow = () => [...document.querySelectorAll("#schedule-body tr")];
const cell = (tr, i) => tr.cells[i]?.firstChild?.textContent.trim() ?? "";

filter.value = ""; filter.dispatchEvent(new Event("change"));
const all = rowsNow();
const dues = all.map(tr => cell(tr, 2));
const sorted = dues.every((d, i) => i === 0 || dues[i - 1] <= d);
const badges = all.filter(tr => tr.querySelector(".badge-delayed"));
const badgeRule = all.every(tr => {
  const expected = cell(tr, 2) < BASE_DATE && cell(tr, 3) !== "완료";
  return !!tr.querySelector(".badge-delayed") === expected;
});
const doneRows = all.filter(tr => cell(tr, 3) === "완료");
const doneGray = doneRows.every(tr => getComputedStyle(tr.cells[0]).color !== getComputedStyle(all.find(r => cell(r, 3) !== "완료").cells[0]).color);

filter.value = "김하늘"; filter.dispatchEvent(new Event("change"));
const kim = rowsNow();
const kimOnly = kim.every(tr => cell(tr, 1) === "김하늘");
filter.value = ""; filter.dispatchEvent(new Event("change"));

({
  "1. 행 수 12": all.length,
  "2. 김하늘 3행": `${kim.length}행, 김하늘만: ${kimOnly}`,
  "3. 지연 3건": `${badges.length}건, 기준일 규칙 일치: ${badgeRule}`,
  "4. 기한순 정렬": sorted,
  "완료 행 회색": `${doneRows.length}행, 회색: ${doneGray}`,
});
```

이어서 `read_console_messages`(onlyErrors)로 콘솔 오류가 없는지 본다.

## 3. 375px에서 검사
- `resize_window` preset `mobile`(375×812) → 같은 주소로 다시 이동 → 아래 스크립트 실행 → 스크린샷 1장.

```js
await new Promise(r => setTimeout(r, 500));
({
  "가로 스크롤 없음": document.documentElement.scrollWidth <= innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth,
  "표 글자 크기": getComputedStyle(document.querySelector("#schedule-body td")).fontSize,
});
```

- 끝나면 반드시 `resize_window` preset `desktop`으로 되돌린다.

## 4. 보고
아래 형식의 표 하나로 보고한다. 기대값과 다르면 ❌와 실제 값을 쓴다.

| 항목 | 기대 | 결과 |
|---|---|---|
| 1. 행 수 | 12 | |
| 2. 김하늘 필터 | 3행 | |
| 3. 지연 표시 | 3건 (기준일 2026-06-15) | |
| 4. 기한순 정렬 | 오름차순 | |
| 완료 행 회색 | 회색 | |
| 375px 가로 스크롤 | 없음 | |
| 표 글자 크기 | 16px | |
| 콘솔 오류 | 없음 | |
