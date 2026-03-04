import WorkGroupDetailPage from '../../../component/workGroups/WorkGroupDetailPage';

const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
const LIST_LIMIT = 100;

function readQueryValue(query = {}, key) {
  const value = query?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export default function WorkGroupDetailRoute({ workGroup, reports, decisions, canonicalPath }) {
  return (
    <WorkGroupDetailPage
      workGroup={workGroup}
      reports={reports}
      decisions={decisions}
      canonicalPath={canonicalPath}
    />
  );
}

export async function getServerSideProps({ params, query }) {
  const slug = String(params?.slug || '').trim();
  if (!slug) {
    return { notFound: true };
  }

  const selectedPeriodId = readQueryValue(query, 'periodId');

  try {
    const workGroupQuery = new URLSearchParams(
      selectedPeriodId ? { period: selectedPeriodId } : {}
    );
    const workGroupRes = await fetch(
      `${apiBaseUrl}/work-groups/slug/${slug}${workGroupQuery.toString() ? `?${workGroupQuery.toString()}` : ''}`
    );

    if (!workGroupRes.ok) {
      return { notFound: true };
    }

    const workGroup = await workGroupRes.json();
    const effectivePeriodId = selectedPeriodId || workGroup?.period?._id || '';

    const reportQuery = new URLSearchParams({
      workGroupSlug: slug,
      limit: String(LIST_LIMIT),
      ...(effectivePeriodId ? { period: effectivePeriodId } : {}),
    });
    const decisionQuery = new URLSearchParams({
      workGroupSlug: slug,
      limit: String(LIST_LIMIT),
      ...(effectivePeriodId ? { period: effectivePeriodId } : {}),
    });

    const [reportsRes, decisionsRes] = await Promise.all([
      fetch(`${apiBaseUrl}/reports?${reportQuery.toString()}`),
      fetch(`${apiBaseUrl}/decisions?${decisionQuery.toString()}`),
    ]);

    const reportsPayload = reportsRes.ok ? await reportsRes.json() : { data: [] };
    const decisionsPayload = decisionsRes.ok ? await decisionsRes.json() : { data: [] };
    const canonicalPath = `/belgeler/calisma-gruplari/${workGroup.slug || slug}${
      effectivePeriodId ? `?periodId=${encodeURIComponent(effectivePeriodId)}` : ''
    }`;

    return {
      props: {
        workGroup,
        reports: reportsPayload.data || [],
        decisions: decisionsPayload.data || [],
        canonicalPath,
      },
    };
  } catch (error) {
    console.error('Work group detail fetch error:', error);
    return { notFound: true };
  }
}
