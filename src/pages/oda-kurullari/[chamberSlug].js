import BoardDirectoryView from "../../component/boards/BoardDirectoryView";
import {
  loadBoardDirectory,
  getEntityName,
  normalizeFilterValue,
} from "../../lib/boardDirectory";
export default function ChamberBoardsPage(props) {
  const name = getEntityName(props.fixedChamber, "Oda");
  return (
    <BoardDirectoryView
      {...props}
      title={`${props.fixedChamber?.short || name} Kurulları`}
      description={`${name} kurulları ve odanın geçmiş dönemleri.`}
      canonicalPath={`/oda-kurullari/${props.chamberSlug}`}
    />
  );
}
export async function getServerSideProps({ params, query }) {
  const slug = normalizeFilterValue(params?.chamberSlug);
  if (!slug) return { notFound: true };
  return loadBoardDirectory(
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
    query,
    slug,
  );
}
