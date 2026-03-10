import BoardDirectoryView from '../../component/boards/BoardDirectoryView';
import {
  fetchBoardDirectoryData,
  getDefaultPeriodIdForBoards,
  getEntityId,
  normalizeFilterValue,
} from '../../lib/boardDirectory';

const PAGE_TITLE = 'Oda Kurulları';
const PAGE_DESCRIPTION = 'Kurul türü, dönem ve oda seçerek oda kurullarını filtreleyebilirsiniz.';

function pickValidFilterValue(rawValue, items = []) {
  const value = normalizeFilterValue(rawValue);
  if (!value) {
    return '';
  }

  const allowedValues = new Set(
    items.map((item) => getEntityId(item)).filter(Boolean)
  );

  return allowedValues.has(value) ? value : '';
}

export default function OdaKurullariPage(props) {
  return (
    <BoardDirectoryView
      title={PAGE_TITLE}
      description={PAGE_DESCRIPTION}
      canonicalPath="/oda-kurullari"
      initialBoards={props.boards}
      initialPeriods={props.periods}
      initialBoardTypes={props.boardTypes}
      initialChambers={props.chambers}
      initialFilters={props.initialFilters}
      fixedChamber={null}
    />
  );
}

export async function getServerSideProps({ query }) {
  const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return {
      props: {
        boards: [],
        periods: [],
        boardTypes: [],
        chambers: [],
        initialFilters: {
          periodId: '',
          typeId: '',
          chamberId: '',
        },
      },
    };
  }

  const { boards, periods, boardTypes, chambers } = await fetchBoardDirectoryData(apiBaseUrl);

  const defaultPeriodId = getDefaultPeriodIdForBoards(periods, boards);
  const periodId = pickValidFilterValue(query.periodId, periods) || defaultPeriodId || '';
  const typeId = pickValidFilterValue(query.typeId, boardTypes);
  const chamberId = pickValidFilterValue(query.chamberId, chambers);

  return {
    props: {
      boards,
      periods,
      boardTypes,
      chambers,
      initialFilters: {
        periodId,
        typeId,
        chamberId,
      },
    },
  };
}
