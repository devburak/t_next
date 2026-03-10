import ContentPageRenderer from '../../component/basic/ContentPageRenderer';
import DecisionCategoryPage from '../../component/decisions/DecisionCategoryPage';
import DecisionDetailPage from '../../component/decisions/DecisionDetailPage';
import ReportCategoryPage from '../../component/reports/ReportCategoryPage';
import ReportDetailPage from '../../component/reports/ReportDetailPage';
import WorkGroupCategoryPage from '../../component/workGroups/WorkGroupCategoryPage';

const REPORT_PAGE_SIZE = 100;
const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
const FIXED_DECISION_TYPE_BY_SLUG = {
  'yonetim-kurulu-kararlari': 'management-board',
};
const LOCK_REPORT_WORK_GROUP_BY_SLUG = new Set(['denetleme-kurulu-raporlari']);

function readQueryValue(query = {}, key) {
  const value = query?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function normalizePeriodsPayload(payload) {
  if (Array.isArray(payload?.periods)) {
    return payload.periods;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function BelgeContentPage({
  view = 'content',
  htmlContent,
  data,
  slug = '',
  reportCategory,
  decisionCategory,
  category,
  reports,
  decisions,
  workGroups,
  totalPages,
  page,
  periods,
  selectedPeriodId,
  selectedWorkGroupSlug,
  selectedDecisionType,
  lockDecisionType = false,
  lockReportWorkGroup = false,
}) {
  if (view === 'workGroupCategory') {
    return (
      <WorkGroupCategoryPage
        slug={slug || 'calisma-gruplari'}
        category={category}
        workGroups={workGroups}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
      />
    );
  }

  if (view === 'reportCategory') {
    return (
      <ReportCategoryPage
        slug={reportCategory?.slug || data?.slug || ''}
        category={reportCategory}
        reports={reports}
        totalPages={totalPages}
        page={page}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        workGroups={workGroups}
        selectedWorkGroupSlug={selectedWorkGroupSlug}
        lockWorkGroupFilter={lockReportWorkGroup}
      />
    );
  }

  if (view === 'decisionCategory') {
    return (
      <DecisionCategoryPage
        slug={decisionCategory?.slug || data?.slug || ''}
        category={decisionCategory}
        decisions={decisions}
        totalPages={totalPages}
        page={page}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        selectedDecisionType={selectedDecisionType}
        lockDecisionType={lockDecisionType}
        workGroups={workGroups}
        selectedWorkGroupSlug={selectedWorkGroupSlug}
      />
    );
  }

  if (view === 'reportDetail') {
    return <ReportDetailPage report={data} />;
  }

  if (view === 'decisionDetail') {
    return <DecisionDetailPage decision={data} />;
  }

  return (
      <ContentPageRenderer
        htmlContent={htmlContent}
        data={data}
        canonicalPath={data?.slug ? `/belgeler/${data.slug}` : ''}
        showPublishDate={false}
      />
  );
}

export async function getServerSideProps({ params, query }) {
  const { slug } = params;
  const page = Math.max(1, parseInt(query?.page, 10) || 1);
  const selectedPeriodId = readQueryValue(query, 'periodId');
  const selectedWorkGroupSlug = readQueryValue(query, 'workGroupSlug');
  const selectedDecisionTypeFromQuery = readQueryValue(query, 'decisionType');
  const fixedDecisionType = FIXED_DECISION_TYPE_BY_SLUG[slug] || '';
  const lockReportWorkGroup = LOCK_REPORT_WORK_GROUP_BY_SLUG.has(slug);
  const effectiveSelectedWorkGroupSlug = lockReportWorkGroup ? '' : selectedWorkGroupSlug;
  const selectedDecisionType = fixedDecisionType || selectedDecisionTypeFromQuery;

  // Takvim ve video-galeri slug'ları /belgeler için mantıklı değil ama gene de filtre ekleyelim
  if (slug === 'takvim' || slug === 'video-galeri') {
    return {
      notFound: true,
    };
  }

  try {
    if (slug === 'calisma-gruplari') {
      const workGroupQueryParams = new URLSearchParams({
        isListed: 'true',
        ...(selectedPeriodId ? { period: selectedPeriodId } : {}),
      });

      const [workGroupsRes, periodsRes, categoryContentRes] = await Promise.all([
        fetch(`${apiBaseUrl}/work-groups?${workGroupQueryParams.toString()}`),
        fetch(`${apiBaseUrl}/periods`),
        fetch(`${apiBaseUrl}/contents/slug/${slug}`),
      ]);

      const workGroupsPayload = workGroupsRes.ok ? await workGroupsRes.json() : [];
      const periodsPayload = periodsRes.ok ? await periodsRes.json() : { periods: [] };
      const categoryContent = categoryContentRes.ok ? await categoryContentRes.json() : null;

      return {
        props: {
          view: 'workGroupCategory',
          slug,
          category: {
            name: categoryContent?.title || 'Çalışma Grupları',
            description: categoryContent?.spot || '',
          },
          workGroups: Array.isArray(workGroupsPayload) ? workGroupsPayload : [],
          periods: normalizePeriodsPayload(periodsPayload),
          selectedPeriodId,
        },
      };
    }

    const reportCategoryRes = await fetch(`${apiBaseUrl}/report-categories/slug/${slug}`);
    if (reportCategoryRes.ok) {
      const reportCategory = await reportCategoryRes.json();

      const queryParams = new URLSearchParams({
        categorySlug: slug,
        page: String(page),
        limit: String(REPORT_PAGE_SIZE),
        ...(selectedPeriodId ? { period: selectedPeriodId } : {}),
        ...(effectiveSelectedWorkGroupSlug ? { workGroupSlug: effectiveSelectedWorkGroupSlug } : {}),
      });
      const workGroupQueryParams = new URLSearchParams({
        isListed: 'true',
        ...(selectedPeriodId ? { period: selectedPeriodId } : {}),
      });
      const workGroupsRequest = lockReportWorkGroup
        ? Promise.resolve(null)
        : fetch(`${apiBaseUrl}/work-groups?${workGroupQueryParams.toString()}`);

      const [reportsRes, periodsRes, workGroupsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/reports?${queryParams.toString()}`),
        fetch(`${apiBaseUrl}/periods`),
        workGroupsRequest,
      ]);

      const reportsPayload = reportsRes.ok ? await reportsRes.json() : { data: [], totalPages: 1 };
      const periodsPayload = periodsRes.ok ? await periodsRes.json() : { periods: [] };
      const workGroupsPayload =
        !lockReportWorkGroup && workGroupsRes?.ok ? await workGroupsRes.json() : [];

      return {
        props: {
          view: 'reportCategory',
          reportCategory,
          reports: reportsPayload.data || [],
          totalPages: reportsPayload.totalPages || 1,
          page,
          periods: normalizePeriodsPayload(periodsPayload),
          workGroups: Array.isArray(workGroupsPayload) ? workGroupsPayload : [],
          selectedPeriodId,
          selectedWorkGroupSlug: effectiveSelectedWorkGroupSlug,
          lockReportWorkGroup,
        },
      };
    }

    const decisionCategoryRes = await fetch(`${apiBaseUrl}/decision-categories/slug/${slug}`);
    if (decisionCategoryRes.ok) {
      const decisionCategory = await decisionCategoryRes.json();
      const queryParams = new URLSearchParams({
        categorySlug: slug,
        page: String(page),
        limit: String(REPORT_PAGE_SIZE),
        ...(selectedPeriodId ? { period: selectedPeriodId } : {}),
        ...(selectedDecisionType ? { decisionType: selectedDecisionType } : {}),
        ...(selectedWorkGroupSlug ? { workGroupSlug: selectedWorkGroupSlug } : {}),
      });
      const workGroupQueryParams = new URLSearchParams({
        isListed: 'true',
        ...(selectedPeriodId ? { period: selectedPeriodId } : {}),
      });

      const [decisionsRes, periodsRes, workGroupsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/decisions?${queryParams.toString()}`),
        fetch(`${apiBaseUrl}/periods`),
        fetch(`${apiBaseUrl}/work-groups?${workGroupQueryParams.toString()}`),
      ]);

      const decisionsPayload = decisionsRes.ok
        ? await decisionsRes.json()
        : { data: [], totalPages: 1 };
      const periodsPayload = periodsRes.ok ? await periodsRes.json() : { periods: [] };
      const workGroupsPayload = workGroupsRes.ok ? await workGroupsRes.json() : [];

      return {
        props: {
          view: 'decisionCategory',
          decisionCategory,
          decisions: decisionsPayload.data || [],
          totalPages: decisionsPayload.totalPages || 1,
          page,
          periods: normalizePeriodsPayload(periodsPayload),
          workGroups: Array.isArray(workGroupsPayload) ? workGroupsPayload : [],
          selectedPeriodId,
          selectedDecisionType,
          lockDecisionType: Boolean(fixedDecisionType),
          selectedWorkGroupSlug,
        },
      };
    }

    const reportRes = await fetch(`${apiBaseUrl}/reports/${slug}`);
    if (reportRes.ok) {
      const report = await reportRes.json();
      if (report?.slug && report.slug !== slug) {
        return {
          redirect: {
            destination: `/belgeler/${report.slug}`,
            permanent: true,
          },
        };
      }

      return {
        props: {
          view: 'reportDetail',
          data: report,
        },
      };
    }

    const decisionRes = await fetch(`${apiBaseUrl}/decisions/${slug}`);
    if (decisionRes.ok) {
      const decision = await decisionRes.json();
      if (decision?.slug && decision.slug !== slug) {
        return {
          redirect: {
            destination: `/belgeler/${decision.slug}`,
            permanent: true,
          },
        };
      }

      return {
        props: {
          view: 'decisionDetail',
          data: decision,
        },
      };
    }

    const res = await fetch(`${apiBaseUrl}/contents/slug/${slug}`);
    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();
    const htmlContent = data.bodyHtml || '';

    return {
      props: { htmlContent, data },
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return { notFound: true };
  }
}

export default BelgeContentPage;
