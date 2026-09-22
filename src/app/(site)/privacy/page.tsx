import type { Metadata } from "next";
import { companyFor } from "@/lib/content/company";

export const metadata: Metadata = {
  title: "개인정보처리방침 | PBA 7-Layer Business Radar",
};

const EFFECTIVE_DATE = "2026년 9월 20일";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-600">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-200 align-top">
              {row.map((cell, j) => (
                <td key={j} className="whitespace-pre-line px-3 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  // This page's copy is entirely Korean regardless of visitor locale (Task 4
  // translates it), so the company block is pinned to "ko" here.
  const company = companyFor("ko");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">개인정보처리방침</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          {company.name}(이하 &lsquo;회사&rsquo;)는 PBA 7-Layer Business Radar(이하 &lsquo;서비스&rsquo;)를
          운영하면서 「개인정보 보호법」에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을
          신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>
        <p className="text-xs text-slate-500">시행일: {EFFECTIVE_DATE}</p>
      </div>

      <Section title="1. 개인정보의 처리 목적">
        <p>회사는 다음 목적을 위해 개인정보를 처리하며, 목적이 변경되는 경우 사전에 동의를 받습니다.</p>
        <ul className="list-disc pl-5">
          <li>진단 결과 리포트(PDF) 이메일 발송</li>
          <li>진단 결과에 기반한 상담(컨설팅) 신청 접수, 안내 및 연락</li>
          <li>
            마케팅 정보 제공(별도 동의 시): 뉴스레터·인사이트 이메일, 세미나·프로그램 안내, 신규
            서비스·이벤트 안내
          </li>
          <li>서비스 이용 통계 분석 및 개선(개인을 식별하지 않는 정보 기준)</li>
          <li>진단 방법론 연구·개선(개인을 식별할 수 없는 형태로 가공한 정보에 한함)</li>
        </ul>
      </Section>

      <Section title="2. 처리하는 개인정보 항목">
        <p>
          진단은 개인정보 수집·이용에 동의하지 않아도 이용할 수 있습니다(익명 진단). 이 경우 이름,
          이메일 등 개인을 식별할 수 있는 정보는 수집하지 않습니다.
        </p>
        <Table
          head={["구분", "항목", "수집 시점"]}
          rows={[
            ["필수 (동의 시)", "이름, 이메일 주소", "진단 시작 시 개인정보 수집·이용에 동의한 경우"],
            ["선택 (동의 시)", "회사/브랜드명, 역할", "진단 시작 시 개인정보 수집·이용에 동의한 경우"],
            [
              "필수 (상담 신청 시)",
              "이름, 이메일 주소, 상담 요청 메시지(선택)",
              "익명 진단 후 상담을 신청하는 경우, 신청 화면에서 동의를 받아 수집",
            ],
            [
              "진단 정보",
              "사업 단계, 업종, 팀 규모, 문항 응답과 진단 결과, 결과 적합도 평가, 연 매출·최근 12개월 성장 구간(선택 입력)",
              "진단 시 (익명 진단 포함). 익명 진단 시에는 이 정보만으로 개인을 식별할 수 없습니다. 개인정보 수집에 동의하거나 상담을 신청한 경우에는 이름·이메일과 함께 개인정보로 처리됩니다.",
            ],
            [
              "자동 수집",
              "쿠키 식별자, 방문 페이지·이용 이벤트, 기기·브라우저 정보, 유입 경로(UTM)",
              "서비스 이용 시 (6항 참조)",
            ],
          ]}
        />
        <p>회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.</p>
      </Section>

      <Section title="3. 개인정보의 처리 및 보유 기간">
        <ul className="list-disc pl-5">
          <li>
            진단·상담 신청 시 수집한 개인정보: 수집일로부터 1년. 단, 정보주체가 동의를 철회하거나
            삭제를 요청하면 지체 없이 파기합니다.
          </li>
          <li>마케팅 정보 수신 동의: 수집일로부터 1년 또는 수신 동의를 철회할 때까지 중 먼저 도래하는 시점</li>
          <li>진단을 끝까지 완료하지 않은 임시 저장 정보: 마지막 입력일로부터 30일</li>
          <li>개인을 식별할 수 없는 진단 정보: 서비스 개선 및 통계 목적으로 보관할 수 있습니다.</li>
          <li>
            상담·컨설팅 계약을 맺은 경우, 계약 이행과 재진단을 위해 계약에서 정한 기간 동안
            보관할 수 있습니다.
          </li>
          <li>
            개인정보를 파기할 때 업종 등 자유 입력 정보와 유입 경로(UTM) 정보도 함께 삭제하여, 남는
            진단 정보로는 개인을 알아볼 수 없도록 합니다.
          </li>
        </ul>
      </Section>

      <Section title="4. 개인정보의 파기 절차 및 방법">
        <p>
          보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일 형태의
          정보는 복구할 수 없는 방법으로 영구 삭제합니다.
        </p>
      </Section>

      <Section title="5. 개인정보의 제3자 제공 및 처리 위탁">
        <p>회사는 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 서비스 운영을 위해 다음과 같이 처리를 위탁합니다.</p>
        <Table
          head={["수탁자", "위탁 업무", "보관 위치"]}
          rows={[
            ["Supabase, Inc.", "데이터베이스 및 운영자 인증 시스템 운영", "대한민국 (AWS 서울 리전)"],
            ["Amazon Web Services, Inc.", "웹 서비스 호스팅", "대한민국 (서울 리전)"],
          ]}
        />
        <p>위탁 계약 시 개인정보가 안전하게 관리될 수 있도록 관련 사항을 규정하고 감독합니다.</p>
      </Section>

      <Section title="6. 개인정보 자동 수집 장치(쿠키)의 설치·운영 및 거부">
        <p>
          회사는 이용 통계를 분석하기 위해 Google Analytics 4를 사용하며, 이 과정에서 쿠키가
          설치됩니다. 쿠키에는 이름·이메일 등 직접적인 식별 정보가 포함되지 않습니다.
        </p>
        <p>
          쿠키 저장을 원하지 않으면 브라우저 설정에서 쿠키를 차단하거나, Google 애널리틱스 차단
          브라우저 부가기능(tools.google.com/dlpage/gaoptout)을 설치할 수 있습니다. 쿠키를 차단해도
          진단 이용에는 제한이 없습니다.
        </p>
      </Section>

      <Section title="7. 개인정보의 국외 이전">
        <p>Google Analytics 4 이용에 따라 다음 정보가 국외로 이전됩니다.</p>
        <Table
          head={["항목", "내용"]}
          rows={[
            ["이전받는 자", "Google LLC (문의: privacy.google.com/contact)"],
            ["이전 국가", "미국"],
            ["이전 항목", "쿠키 식별자, 방문 페이지·이용 이벤트, 기기·브라우저 정보"],
            ["이전 일시 및 방법", "서비스 이용 시 네트워크를 통해 전송"],
            ["이용 목적", "서비스 이용 통계 분석"],
            ["보유 기간", "Google Analytics 데이터 보존 설정 기간(최대 14개월)"],
            ["거부 방법 및 효과", "6항의 방법으로 거부할 수 있으며, 거부해도 서비스 이용에 제한이 없습니다."],
          ]}
        />
      </Section>

      <Section title="8. 정보주체의 권리·의무 및 행사 방법">
        <p>
          정보주체는 회사에 대해 언제든지 개인정보 열람, 정정, 삭제, 처리정지 및 동의 철회를 요구할
          수 있습니다. 아래 개인정보 보호책임자에게 이메일로 요청하시면 지체 없이(10일 이내)
          조치하겠습니다. 법정대리인이나 위임을 받은 자를 통해서도 권리를 행사할 수 있습니다.
        </p>
      </Section>

      <Section title="9. 개인정보의 안전성 확보 조치">
        <ul className="list-disc pl-5">
          <li>개인정보에 접근할 수 있는 운영자를 최소화하고 계정·권한을 분리하여 관리</li>
          <li>데이터베이스 접근 통제(행 단위 보안 정책) 및 서버 전용 인증키 관리</li>
          <li>전송 구간 암호화(HTTPS)</li>
          <li>운영자 비밀번호 변경 시 기존 로그인 세션 무효화</li>
        </ul>
      </Section>

      <Section title="10. 개인정보 보호책임자">
        <Table
          head={["구분", "내용"]}
          rows={[
            ["성명", `${company.ceo} (${company.ceoTitle})`],
            ["이메일", company.email],
            ["연락처", company.phone],
          ]}
        />
      </Section>

      <Section title="11. 권익침해 구제 방법">
        <p>개인정보 침해로 인한 구제를 받기 위해 아래 기관에 분쟁 해결이나 상담을 신청할 수 있습니다.</p>
        <ul className="list-disc pl-5">
          <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
          <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
          <li>대검찰청: 1301 (www.spo.go.kr)</li>
          <li>경찰청: 182 (ecrm.police.go.kr)</li>
        </ul>
      </Section>

      <Section title="12. 개인정보처리방침의 변경">
        <p>이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용됩니다. 내용이 변경되는 경우 시행 7일 전부터 서비스를 통해 공지합니다.</p>
      </Section>
    </main>
  );
}
