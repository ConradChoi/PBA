# PBA 7-Layer Business Radar 웹서비스 요구사항서
Version: 1.0  
Brand: `최종훈 PBA | Principal Business Architect`  
Target domain: `pba.ylia.io`  
Project type: 독립 신규 웹서비스  
Important: **BARA 도형심리 역량진단과 완전히 별개의 시스템으로 개발한다.**

---

## 0. Claude 작업 지시

이 문서는 `pba.ylia.io`에서 운영할 **PBA 7-Layer Business Radar**의 제품/개발 요구사항이다.

### 반드시 지킬 것
1. `bara-edu.kr` 또는 도형심리 관련 기능/데이터/브랜드를 절대 섞지 않는다.
2. 독립 프로젝트, 독립 배포, 독립 데이터 저장 구조를 전제로 한다.
3. 첫 방문자가 "사업 컨설팅"이라는 추상적 표현보다 **5분 사업 구조 진단**의 가치를 먼저 이해하도록 설계한다.
4. 결과 화면이 이 서비스의 핵심 제품이다.
5. 단순 점수 테스트가 아니라 **작은 컨설팅을 받은 느낌**이 나야 한다.
6. 모바일 우선 반응형.
7. 결과 해석 문구/룰은 코드 하드코딩보다 config/data layer로 관리한다.

---

# 1. 제품 정의

## 제품명
우선 작업명:
`PBA 7-Layer Business Radar`

표시명 후보:
- PBA Business Radar
- PBA 7-Layer Radar

MVP에서는 `PBA 7-Layer Business Radar` 사용.

## 핵심 메시지
`5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.`

## Brand statement
`아이디어를 사업으로, 사업을 시스템으로.`

## 진단 목적
사업의 7개 구조 영역을 점수화하고 가장 큰 병목을 찾아 우선 개선 순서를 제시한다.

7 Layers:
1. VALUE
2. CUSTOMER
3. OFFER
4. EXPERIENCE
5. PROCESS
6. DATA & INTELLIGENCE
7. SCALE

---

# 2. 주요 고객

## Persona A — 예비/초기 창업자
- 아이디어는 있으나 무엇부터 정리할지 모름
- MVP 개발 전

## Persona B — 운영 중인 중소사업 대표
- 매출은 있으나 운영이 대표에게 의존
- 반복업무/병목 존재

## Persona C — 신사업/서비스 책임자
- 새 서비스 기획
- 조직 내 이해관계자 정렬 필요

## Persona D — AI 도입 고민 기업
- "AI를 어디에 써야 하는가?" 문제
- 프로세스/데이터 구조가 먼저 필요한 조직

---

# 3. 비즈니스 목표

1. PBA 방법론을 직접 체험시키는 Lead Magnet
2. 사용자가 자기 사업의 구조적 약점을 인식하도록 도움
3. 상담 신청 전 현재 상태 데이터 확보
4. PBA 컨설팅/Architecture Sprint로 전환
5. 향후 PBA 고유 방법론의 대표 Proof Product로 사용

---

# 4. 전체 UX Flow

```text
pba.ylia.io
    ↓
Hero / 가치 제안
    ↓
[무료 진단 시작]
    ↓
기본 사업정보
    ↓
28문항
    ↓
Score Engine
    ↓
7-Layer Radar
    ↓
Architecture Level
    ↓
Business Bottleneck Top 3
    ↓
90-Day Priority
    ↓
PDF/이메일 결과 선택
    ↓
PBA 상담 / Architecture Sprint CTA
```

---

# 5. 화면 IA

## 5.1 Landing
Hero:
- `사업이 막힐 때, 기능보다 구조부터 봅니다.`
- `5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.`
- CTA: `무료 Business Radar 시작하기`

보조:
- 28문항
- 약 5분
- 7개 구조 영역
- 결과 즉시 확인

신뢰 요소:
- PBA 7-Layer Method 간단 소개
- 결과 샘플 미리보기
- 개인정보/마케팅 동의 분리

## 5.2 Basic Info
권장:
- 이름
- 이메일
- 회사/브랜드명(선택)
- 역할
- 사업 단계
  - 아이디어
  - MVP 준비
  - 구축 중
  - 운영 중
  - 성장
  - 재정비
  - 기타 (직접 입력)
- 업종(선택)
- 팀 규모(선택)
- 월 매출 범위(선택; 초기 MVP에서는 제거 가능)

이메일을 결과 PDF 전달 조건으로 받을지 UX 테스트 가능.

## 5.3 Questions
7섹션 × 4문항.
- 한 Layer당 한 화면 권장
- 4문항 모두 답변 후 다음
- 상단 1/7 progress
- 현재 Layer 설명 1줄

## 5.4 Result
순서 고정 권장:
1. Architecture Score
2. Architecture Level
3. 7-Layer Radar
4. 핵심 한 문단 해석
5. Bottleneck Top 3
6. Strength Top 2
7. 90-Day Architecture Priority
8. 상담 CTA
9. PDF/이메일

---

# 6. 응답 척도

1~5점.

| 점수 | 의미 |
|---|---|
| 1 | 전혀 정리되지 않음 |
| 2 | 생각은 있으나 구체적이지 않음 |
| 3 | 어느 정도 정리되어 있음 |
| 4 | 실제 운영에 적용되고 있음 |
| 5 | 명확하게 정의되고 데이터로 관리됨 |

---

# 7. 문항

## L1. VALUE
Q1. 고객이 해결하고 싶은 핵심 문제가 한 문장으로 정의되어 있는가?  
Q2. 기존 대안보다 우리 서비스를 선택해야 하는 이유가 명확한가?  
Q3. 우리가 제공하는 가치와 고객이 실제로 원하는 가치가 일치하는가?  
Q4. 고객이 비용을 지불해야 할 이유를 설명할 수 있는가?

## L2. CUSTOMER
Q1. 핵심 고객을 구체적으로 정의했는가?  
Q2. 서비스 사용자와 실제 구매자가 다를 경우 각각 정의되어 있는가?  
Q3. 고객이 구매를 결정하게 만드는 Trigger를 알고 있는가?  
Q4. 고객별로 다른 요구와 니즈를 구분하고 있는가?

## L3. OFFER
Q1. 핵심 상품 또는 서비스가 명확하게 정의되어 있는가?  
Q2. 무료 → 입문 → 핵심 → 고가 상품으로 연결되는 구조가 있는가?  
Q3. 가격의 기준과 고객이 체감하는 가치가 연결되어 있는가?  
Q4. 일회성 매출 외 반복 매출 구조가 존재하는가?

## L4. EXPERIENCE
Q1. 고객이 우리를 처음 발견하는 경로를 알고 있는가?  
Q2. 관심 → 구매 → 사용 → 재구매 과정이 설계되어 있는가?  
Q3. 고객이 이탈하는 주요 지점을 파악하고 있는가?  
Q4. 고객 경험이 담당자의 역량에 지나치게 의존하지 않는가?

## L5. PROCESS
Q1. 고객 요청부터 업무 완료까지 전체 프로세스를 설명할 수 있는가?  
Q2. 반복적인 수작업이 무엇인지 알고 있는가?  
Q3. 사람이 해야 할 일과 시스템이 해야 할 일이 분리되어 있는가?  
Q4. 대표 또는 특정 직원이 빠져도 업무가 돌아가는가?

## L6. DATA & INTELLIGENCE
Q1. 고객 행동과 서비스 이용 데이터가 기록되고 있는가?  
Q2. 어떤 데이터를 왜 수집하는지 정의되어 있는가?  
Q3. 데이터를 이용해 고객 경험이나 업무를 개선하고 있는가?  
Q4. AI 또는 자동화를 적용할 지점이 구체적으로 정의되어 있는가?

## L7. SCALE
Q1. 매출이 증가해도 대표의 업무시간이 같은 비율로 증가하지 않는가?  
Q2. 업무 표준과 운영 매뉴얼이 존재하는가?  
Q3. 반복 매출 또는 구독·라이선스 구조가 존재하는가?  
Q4. 다른 사람이 동일한 품질로 서비스를 제공할 수 있는가?

---

# 8. 점수 계산

각 Layer:
- 4문항 × 1~5점
- 최소 4 / 최대 20

전체:
- 최소 28 / 최대 140

## Radar용 0~100 환산
```text
layer_score_100 = ((raw_score - 4) / 16) × 100
```

권장: 소수점 없이 반올림.

## 전체 표시
원점수: `/140`
추가로 100점 환산 점수도 내부 데이터로 저장 가능.

---

# 9. Architecture Level

## 120~140 — SYSTEMIZED
설명:
`사업 구조가 상당히 체계화되어 있습니다. 다음 과제는 데이터, AI, 자동화, 확장 효율을 높이는 것입니다.`

## 95~119 — GROWTH READY
설명:
`기본 구조는 갖춰져 있으나 특정 Layer가 성장의 병목이 될 가능성이 있습니다.`

## 70~94 — STRUCTURE NEEDED
설명:
`서비스는 존재하지만 고객·상품·프로세스·데이터가 충분히 연결되지 않은 상태입니다.`

## 40~69 — FOUNDER DEPENDENT
설명:
`사업이 대표자 또는 특정 인력의 경험과 판단에 크게 의존하고 있습니다.`

## 28~39 — IDEA STAGE
설명:
`개발과 마케팅보다 Value · Customer · Offer 정의가 먼저 필요한 단계입니다.`

---

# 10. Bottleneck Top 3

7개 Layer의 100점 환산 점수를 오름차순 정렬하여 최저 3개를 선택한다.

동점 처리:
1. PROCESS
2. CUSTOMER
3. VALUE
4. OFFER
5. EXPERIENCE
6. DATA & INTELLIGENCE
7. SCALE

위 우선순위를 강제할 필요는 없으며, config로 수정 가능하게 한다.

## 영역별 Bottleneck 메시지 예시

### VALUE
`고객 문제와 구매 이유가 충분히 선명하지 않습니다. 기능 추가보다 가치 제안을 다시 정의하는 것이 우선입니다.`

### CUSTOMER
`누구를 위한 서비스인지 범위가 넓거나 구매자와 사용자가 분리되어 있지 않을 가능성이 있습니다.`

### OFFER
`상품 구조와 가격, 반복매출 구조가 충분히 연결되어 있지 않습니다.`

### EXPERIENCE
`고객 유입부터 재사용까지의 여정 중 이탈 지점을 관리할 필요가 있습니다.`

### PROCESS
`업무가 사람의 기억과 수작업에 의존하고 있습니다. 프로세스 정의와 역할 분리가 우선입니다.`

### DATA & INTELLIGENCE
`서비스에서 발생하는 데이터가 의사결정과 AI/자동화에 충분히 활용되지 않고 있습니다.`

### SCALE
`매출이 늘수록 대표나 팀의 업무시간도 비례해 증가할 가능성이 있습니다.`

---

# 11. Strength Top 2

Layer 점수 상위 2개를 표시.

각 영역별 positive copy를 config로 관리.

예:
- VALUE: `사업이 제공하려는 가치가 비교적 명확합니다.`
- CUSTOMER: `핵심 고객과 구매 상황에 대한 이해가 좋은 편입니다.`
- PROCESS: `업무 흐름과 역할이 비교적 잘 정의되어 있습니다.`

---

# 12. 90-Day Architecture Priority

가장 낮은 3개 Layer를 바탕으로 30일 단위 제안 생성.

기본 구조:
```text
1~30일: 가장 낮은 Layer 정리
31~60일: 두 번째 병목 개선
61~90일: 세 번째 병목 개선 + 연결
```

단순 문구가 아니라 Layer별 Action Library를 준비한다.

## Action Library 예시

### VALUE
- 핵심 고객 문제 1문장 정의
- 기존 대안 비교
- 구매 이유 인터뷰

### CUSTOMER
- Primary/Secondary/Buyer/User 구분
- JTBD 정의
- 구매 Trigger 정리

### OFFER
- Product Ladder 작성
- 핵심 상품/옵션 정리
- 반복매출 가능성 검토

### EXPERIENCE
- Customer Journey Map
- 전환/이탈 지점 정의
- 핵심 CTA 정리

### PROCESS
- AS-IS Process Map
- 반복업무 식별
- HUMAN / AI-ASSIST / AUTO 구분

### DATA & INTELLIGENCE
- 핵심 데이터 정의
- 이벤트/행동 로그 정의
- AI Opportunity Map

### SCALE
- 표준 업무 정의
- 대표 의존 업무 제거
- 구독/라이선스/파트너 구조 검토

---

# 13. 결과 해석 생성 방식

## MVP 권장
**Rule-based 우선.**

이유:
- 결과 일관성
- 비용 없음
- 과장/환각 방지
- 테스트 용이

구성:
1. Architecture Level 템플릿
2. Lowest Layer 템플릿
3. Strength 템플릿
4. 조합 템플릿

## 향후 AI 옵션
AI를 사용할 경우:
- 점수/기본정보/정의된 템플릿만 전달
- 절대 임의의 재무/시장 사실 생성 금지
- "진단적 참고"임을 명시
- 생성 결과 로그 저장 가능

---

# 14. Radar Chart

7개 축:
- VALUE
- CUSTOMER
- OFFER
- EXPERIENCE
- PROCESS
- DATA
- SCALE

Chart.js 권장.
Google Charts에 종속되지 않는다.

UI:
- 0~100 scale
- Hover/tap 시 점수
- 모바일에서 label 겹침 방지
- 이미지 export 가능하도록 설계 권장

---

# 15. 1페이지 Radar Report

결과 페이지와 PDF의 핵심 구성.

## Header
- PBA 7-Layer Business Radar
- 진단자명 / 회사명 / 날짜

## Score
- `Architecture Score 82 / 140`
- `STRUCTURE NEEDED`

## Radar
7축 차트

## Summary
2~4문장

## Top 3 Bottlenecks
1. PROCESS
2. DATA & INTELLIGENCE
3. SCALE

## Strength
상위 2개

## 90-Day Priority
3단계

## CTA
`PBA Architecture Session`

---

# 16. Supabase 연동

Google 종속 없이 **Supabase 생태계**로 데이터/파일/이메일을 처리한다.

## 권장 구성

### A. Supabase Database (Postgres)
용도:
- 진단 결과 저장 (기존 Google Sheets 대체)
- 상담 신청 데이터 저장
- 운영자는 Supabase Studio 또는 별도 관리자 대시보드에서 조회 (초기 CRM 대용)

### B. Supabase Storage
용도:
- 생성된 PDF 리포트 저장 (기존 Google Drive 대체)
- private 버킷 + 만료시간이 있는 signed URL로만 전달, 공개 접근 차단

### C. PDF 생성 (Google Docs API 대체)
용도:
- 1페이지 결과 템플릿을 서버(Next.js API Route)에서 HTML → PDF로 렌더링
- 이름/점수/해석/우선순위는 서버에서 템플릿에 치환 후 렌더링
- 권장 라이브러리: `@react-pdf/renderer` 또는 headless Chromium(`puppeteer-core` + `@sparticuz/chromium`)
- 완성된 PDF는 Supabase Storage에 업로드하고 경로를 `assessments.report_pdf_path`에 저장

### D. 이메일
용도:
- 결과 PDF 링크 발송, 상담 신청 확인 메일
- Supabase는 자체 트랜잭션 이메일 발송 기능을 제공하지 않으므로 **Resend**(권장) 또는 Postmark 등 외부 서비스를 서버(API Route/Edge Function)에서 호출
- API Key는 서버 환경변수로만 보관, 클라이언트 노출 금지
- MVP에서는 웹 결과만 먼저 제공하고 이메일/PDF는 Phase 2 가능(기존 방침 유지)

---

# 17. Supabase 데이터베이스 스키마

## assessments 테이블
```sql
create table assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company_name text,
  role text,
  business_stage text not null
    check (business_stage in ('idea','mvp_prep','building','operating','growth','realign','other')),
  business_stage_other text,
  industry text,
  team_size text,
  score_value_raw smallint not null check (score_value_raw between 4 and 20),
  score_value_100 smallint not null check (score_value_100 between 0 and 100),
  score_customer_raw smallint not null check (score_customer_raw between 4 and 20),
  score_customer_100 smallint not null check (score_customer_100 between 0 and 100),
  score_offer_raw smallint not null check (score_offer_raw between 4 and 20),
  score_offer_100 smallint not null check (score_offer_100 between 0 and 100),
  score_experience_raw smallint not null check (score_experience_raw between 4 and 20),
  score_experience_100 smallint not null check (score_experience_100 between 0 and 100),
  score_process_raw smallint not null check (score_process_raw between 4 and 20),
  score_process_100 smallint not null check (score_process_100 between 0 and 100),
  score_data_raw smallint not null check (score_data_raw between 4 and 20),
  score_data_100 smallint not null check (score_data_100 between 0 and 100),
  score_scale_raw smallint not null check (score_scale_raw between 4 and 20),
  score_scale_100 smallint not null check (score_scale_100 between 0 and 100),
  total_raw smallint not null check (total_raw between 28 and 140),
  architecture_level text not null
    check (architecture_level in ('IDEA_STAGE','FOUNDER_DEPENDENT','STRUCTURE_NEEDED','GROWTH_READY','SYSTEMIZED')),
  bottleneck_1 text not null,
  bottleneck_2 text not null,
  bottleneck_3 text not null,
  strength_1 text not null,
  strength_2 text not null,
  consulting_cta_clicked boolean not null default false,
  consulting_requested boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  marketing_consent boolean not null default false,
  report_pdf_path text
);
```

`business_stage` 매핑: `idea`=아이디어, `mvp_prep`=MVP 준비, `building`=구축 중, `operating`=운영 중, `growth`=성장, `realign`=재정비, `other`=기타(직접 입력, `business_stage_other` 컬럼에 저장)

## consulting_requests 테이블
```sql
create table consulting_requests (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  preferred_contact text not null,
  message text,
  requested_at timestamptz not null default now()
);
```

## Row Level Security
클라이언트(anon key)는 **insert만 가능**하고 select/update/delete는 불가능해야 한다. 조회/수정은 service role key를 쓰는 서버 라우트에서만 수행한다.

```sql
alter table assessments enable row level security;
alter table consulting_requests enable row level security;

create policy "anon can insert assessments"
  on assessments for insert
  to anon
  with check (true);

create policy "service role full access assessments"
  on assessments for all
  to service_role
  using (true) with check (true);

create policy "anon can insert consulting_requests"
  on consulting_requests for insert
  to anon
  with check (true);

create policy "service role full access consulting_requests"
  on consulting_requests for all
  to service_role
  using (true) with check (true);
```

## Storage 버킷 (PDF 리포트)
```sql
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false);

create policy "service role manage reports"
  on storage.objects for all
  to service_role
  using (bucket_id = 'reports')
  with check (bucket_id = 'reports');
```

버킷은 반드시 `public = false`로 유지하고, 사용자에게는 만료시간이 있는 signed URL만 전달한다.

---

# 18. 기술 아키텍처

정확한 stack은 Claude가 프로젝트 생성 전 제안 가능.

권장 예:
```text
Frontend: Next.js
UI: Tailwind CSS 또는 프로젝트 표준
Chart: Chart.js
Backend/API: Next.js API routes / server actions
Database: Supabase (Postgres)
File Storage: Supabase Storage
PDF 생성 (Phase 2): 서버사이드 HTML→PDF 렌더링 후 Supabase Storage 업로드
이메일 (Phase 2): Resend
Deployment: Vercel 등
Domain: pba.ylia.io
```

단, 기존 ylia.io 인프라/호스팅과 충돌하지 않게 먼저 확인한다.

Supabase credential:
- `service_role` 키는 절대 client bundle에 포함하지 않음, 서버 환경변수로만 사용
- `anon` 키는 클라이언트에서 사용 가능하지만 RLS로 insert-only 등 최소 권한을 강제
- 관리자 조회/수정/리포트 생성은 `service_role` 키를 쓰는 서버 라우트에서만 수행

## 환경변수
```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # 서버 전용, 절대 클라이언트 노출 금지
RESEND_API_KEY              # Phase 2, 서버 전용
```

---

# 19. 추천 데이터 구조

문항/결과 문구를 코드에 박지 않고 config화.

예:
```ts
type Layer = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  questions: Question[];
  bottleneckCopy: string;
  strengthCopy: string;
  actions: string[];
}
```

질문 수정 시 화면 코드를 변경하지 않도록 설계.

---

# 20. 상담 전환

결과 화면 CTA:
- Primary: `내 사업 구조 상담하기`
- Secondary: `결과 PDF 받기`

상담 신청 시 진단 결과를 함께 전달.

상담 폼에 같은 정보를 다시 입력하게 하지 않는다.

상담 요청 데이터:
```text
assessment_id
preferred_contact
message
requested_at
```

---

# 21. 이벤트 분석

권장 이벤트:
```text
radar_landing_view
radar_start
radar_layer_complete
radar_complete
radar_result_view
radar_pdf_request
radar_consulting_click
radar_consulting_submit
```

GA4 사용 권장.

추후 KPI:
- Landing → Start
- Start → Complete
- Complete → Result
- Result → PDF
- Result → Consultation
- Consultation → Paid

---

# 22. 개인정보/보안

- 개인정보 최소 수집
- 결과 확인만 할 경우 익명 진단 옵션 검토
- PDF/이메일을 원할 때 이메일 수집 가능
- 마케팅 동의와 결과 전달 동의 분리
- Supabase `service_role` 키 노출 금지, `anon` 키는 RLS로 insert-only 등 최소 권한만 부여
- 입력값 검증
- rate limiting / bot protection 검토
- 개인정보처리방침 링크 제공
- 삭제 요청 처리 경로 마련

---

# 23. UX 원칙

- 5분 이내
- 질문 문장은 짧고 쉽게
- 한 화면 정보량 최소화
- 진단 중 결과 예측 노출 금지
- 결과는 "나쁜 사업"처럼 낙인찍지 않음
- 낮은 점수 = 다음 개선 우선순위로 표현
- 전문적이되 과도한 컨설팅 용어 자제

---

# 24. 디자인 방향

브랜드 인상:
- 전문적
- 구조적
- 컨설팅/아키텍처 느낌
- 과도하게 금융/검사 서비스처럼 보이지 않음

결과 페이지:
- Radar를 중심 비주얼
- 7 Layer 카드
- Top 3 Bottleneck 강조
- 90-Day Roadmap 시각화

최종훈 PBA:
`Principal Business Architect | 사업구조 설계자`

Tagline:
`아이디어를 사업으로, 사업을 시스템으로.`

---

# 25. MVP

## Phase 1
- Landing
- 기본정보
- 28문항
- 점수 계산
- Architecture Level
- Radar
- Bottleneck Top 3
- Strength Top 2
- 90-Day Priority
- Supabase 저장 (assessments 테이블)
- 상담 CTA
- GA4

## Phase 2
- 서버사이드 결과 템플릿 렌더링
- Radar 이미지 생성
- PDF 생성 후 Supabase Storage 업로드
- Resend를 통한 이메일 자동발송
- 상담 신청은 consulting_requests 테이블로 연결, 필요 시 외부 CRM 연동

## Phase 3
- AI narrative
- 업종별 benchmark
- 재진단 비교
- 조직/팀용 결과
- 유료 상세 리포트

---

# 26. 테스트 케이스

반드시 최소 다음 케이스를 자동/수동 테스트.

## Case 1
모든 응답 1점
- total 28
- IDEA STAGE
- 모든 radar 0

## Case 2
모든 응답 5점
- total 140
- SYSTEMIZED
- 모든 radar 100

## Case 3
모든 응답 3점
- total 84
- STRUCTURE NEEDED
- 모든 radar 50

## Case 4
PROCESS/DATA/SCALE 저점
- Top 3가 해당 영역인지 검증

## Case 5
중간 저장 후 복귀
- 응답 보존 확인

---

# 27. 완료 기준(Acceptance Criteria)

- [ ] `pba.ylia.io` 독립 프로젝트로 실행
- [ ] BARA/도형심리 코드 또는 데이터 없음
- [ ] 28문항 정상 동작
- [ ] 모든 점수 공식 테스트 통과
- [ ] Architecture Level 판정 정확
- [ ] Radar 차트 정상
- [ ] Bottleneck Top 3 정확
- [ ] Strength Top 2 정확
- [ ] 90-Day Priority 생성
- [ ] Supabase 저장(assessments 테이블) 정상 동작
- [ ] RLS 정책으로 anon 조회/수정/삭제 차단 확인
- [ ] CTA에서 assessment_id 유지
- [ ] 모바일/PC 반응형
- [ ] 접근성 기본 충족
- [ ] `service_role` 키 서버 전용 보관, 클라이언트 미노출
- [ ] GA4 이벤트 발생
- [ ] Lighthouse 주요 오류 없음

---

# 28. Claude 구현 완료 시 제출할 것

1. 전체 폴더 구조
2. 주요 컴포넌트 설명
3. 점수 계산 모듈
4. 추천/해석 config
5. 환경변수 목록
6. Supabase 프로젝트 생성 및 환경변수 설정 절차
7. 테이블/RLS/Storage 버킷 마이그레이션 적용 절차
8. 로컬 실행 방법
9. 테스트 결과
10. 배포 및 DNS 연결 방법
11. Phase 2 구현 TODO