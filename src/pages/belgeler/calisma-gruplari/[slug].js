import WorkGroupDetailPage from '../../../component/workGroups/WorkGroupDetailPage';

const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
const LIST_LIMIT = 100;

function readQueryValue(query = {}, key) {
  const value = query?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export default function WorkGroupDetailRoute({ workGroup, reports, decisions, relatedContents, contentPage, contentTotalPages, canonicalPath, periods }) {
  return (
    <WorkGroupDetailPage
      workGroup={workGroup}
      periods={periods}
      reports={reports}
      decisions={decisions}
      relatedContents={relatedContents}
      contentPage={contentPage}
      contentTotalPages={contentTotalPages}
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
    const workGroupQuery = new URLSearchParams({ isListed: 'true', ...(selectedPeriodId ? { period: selectedPeriodId } : {}) });
    const familyRes = await fetch(`${apiBaseUrl}/work-group-families/${encodeURIComponent(slug)}?${workGroupQuery}`);
    if (!familyRes.ok) return { notFound: true };
    const family = await familyRes.json();
    const term = family.activeTerm;
    const workGroup = { ...(term || {}), _id: term?._id || family._id, name: family.name, slug: family.slug,
      description: term?.description || family.description, familyId: family._id };
    const periods = (family.periods || []).map(row => row.period).filter(Boolean);
    const effectivePeriodId = term?.period?._id || '';

    const reportQuery = new URLSearchParams({
      workGroup: term?._id || family._id,
      limit: String(LIST_LIMIT),
      ...(effectivePeriodId ? { period: effectivePeriodId } : {}),
    });
    const decisionQuery = new URLSearchParams({
      workGroup: term?._id || family._id,
      limit: String(LIST_LIMIT),
      ...(effectivePeriodId ? { period: effectivePeriodId } : {}),
    });

    const contentPage = Math.max(1, Number.parseInt(readQueryValue(query, 'contentPage'), 10) || 1);
    const [reportsRes, decisionsRes, contentsRes] = await Promise.all([
      term ? fetch(`${apiBaseUrl}/reports?${reportQuery.toString()}`) : Promise.resolve(null),
      term ? fetch(`${apiBaseUrl}/decisions?${decisionQuery.toString()}`) : Promise.resolve(null),
      term ? fetch(`${apiBaseUrl}/contents/work-group/${term._id}?page=${contentPage}&limit=10`) : Promise.resolve(null),
    ]);

    const reportsPayload = reportsRes?.ok ? await reportsRes.json() : { data: [] };
    const decisionsPayload = decisionsRes?.ok ? await decisionsRes.json() : { data: [] };
    const contentsPayload = contentsRes?.ok ? await contentsRes.json() : { contents: [], totalPages: 0 };
    const canonicalPath = `/belgeler/calisma-gruplari/${workGroup.slug || slug}${
      effectivePeriodId ? `?periodId=${encodeURIComponent(effectivePeriodId)}` : ''
    }`;

    return {
      props: {
        workGroup,
        periods,
        reports: reportsPayload.data || [],
        decisions: decisionsPayload.data || [],
        canonicalPath,
        relatedContents: contentsPayload.contents || [],
        contentPage,
        contentTotalPages: contentsPayload.totalPages || 0,
      },
    };
  } catch (error) {
    console.error('Work group detail fetch error:', error);
    return { notFound: true };
  }
}
