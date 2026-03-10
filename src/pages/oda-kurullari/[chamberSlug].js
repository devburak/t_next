import BoardDirectoryView from '../../component/boards/BoardDirectoryView';
import {
  fetchBoardDirectoryData,
  filterBoards,
  getChamberSlug,
  getDefaultPeriodIdForBoards,
  getEntityId,
  getEntityName,
  normalizeFilterValue,
} from '../../lib/boardDirectory';

function pickValidPeriodId(rawValue, periods = []) {
  const value = normalizeFilterValue(rawValue);
  if (!value) {
    return '';
  }

  const allowedValues = new Set(
    periods.map((period) => getEntityId(period)).filter(Boolean)
  );

  return allowedValues.has(value) ? value : '';
}

export default function ChamberBoardsPage(props) {
  const chamberName = getEntityName(props.fixedChamber, 'Oda');
  const chamberShort = String(props.fixedChamber?.short || '').trim();
  const title = chamberShort ? `${chamberShort} Kurulları` : `${chamberName} Kurulları`;

  return (
    <BoardDirectoryView
      title={title}
      description={`${chamberName} için kurul listesi. Dönem filtresi ile tüm kurulları görüntüleyebilirsiniz.`}
      canonicalPath={`/oda-kurullari/${props.chamberSlug}`}
      initialBoards={props.boards}
      initialPeriods={props.periods}
      initialBoardTypes={props.boardTypes}
      initialChambers={props.chambers}
      initialFilters={props.initialFilters}
      fixedChamber={props.fixedChamber}
    />
  );
}

export async function getServerSideProps({ params, query }) {
  const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const chamberSlug = normalizeFilterValue(params?.chamberSlug);

  if (!apiBaseUrl || !chamberSlug) {
    return { notFound: true };
  }

  const { boards, periods, boardTypes, chambers } = await fetchBoardDirectoryData(apiBaseUrl);
  const fixedChamber = chambers.find((chamber) => getChamberSlug(chamber) === chamberSlug);

  if (!fixedChamber) {
    return { notFound: true };
  }

  const fixedChamberId = getEntityId(fixedChamber);
  const chamberBoards = filterBoards(boards, { chamberId: fixedChamberId });
  const defaultPeriodId = getDefaultPeriodIdForBoards(periods, chamberBoards);
  const periodId = pickValidPeriodId(query.periodId, periods) || defaultPeriodId || '';

  return {
    props: {
      chamberSlug,
      boards: chamberBoards,
      periods,
      boardTypes,
      chambers,
      fixedChamber,
      initialFilters: {
        periodId,
        typeId: '',
        chamberId: fixedChamberId,
      },
    },
  };
}
