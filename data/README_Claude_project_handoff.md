# Claude 전달용 프로젝트 파일 안내

두 프로젝트는 서로 완전히 독립적입니다.

## 1. BARA 도형심리 역량진단
파일: `BARA_shape_competency_diagnosis_requirements.md`

- 대상: `bara-edu.kr`
- 기존 사이트 내부 기능 추가
- 목적: 현재 역량 확인 + 적합한 2급/1급/강사과정 안내
- 핵심 전환: 추천 과정 상세/수강 신청
- 진단: 6개 영역, 30문항
- Radar는 보조 시각화

## 2. PBA 7-Layer Business Radar
파일: `PBA_7Layer_business_radar_requirements.md`

- 대상: `radar.ylia.io`
- 독립 신규 웹서비스
- 목적: 사업구조 병목 진단 + PBA 컨설팅 리드
- 핵심 전환: Architecture Session/컨설팅
- 진단: 7개 영역, 28문항
- Radar와 Business Bottleneck Top 3가 핵심 결과

## Claude에 전달할 때 권장 프롬프트

### BARA
> 첨부한 MD 요구사항을 기준으로 현재 bara-edu.kr 코드베이스를 먼저 분석하고, 기존 기능과 디자인을 유지한 채 도형심리 역량진단 기능을 구현해줘. 구현 전에 현재 스택과 수정 대상 파일을 요약하고, 요구사항과 충돌하는 부분이 있으면 가장 안전한 방식으로 판단해 진행해줘. PBA Radar와는 별개 시스템이다.

### PBA
> 첨부한 MD 요구사항을 기준으로 radar.ylia.io용 독립 웹서비스를 구현해줘. 1차 목표는 MVP 완성이다. 점수 계산/진단 로직은 UI와 분리하고 테스트 가능하게 구현하며, 데이터 저장/파일/이메일은 Supabase 생태계(Database, Storage, Resend)로 처리하고 `service_role` 키는 서버에서만 사용해줘. BARA/도형심리 시스템과는 완전히 독립이다.