import BoardDirectoryView from "../../component/boards/BoardDirectoryView";
import { loadBoardDirectory } from "../../lib/boardDirectory";
export default function OdaKurullariPage(props) {
  return (
    <BoardDirectoryView
      {...props}
      title="Oda Kurulları"
      description="Odaların en son kayıtlı kurulları. Geçmiş dönemler için oda sayfasına gidin."
      canonicalPath="/oda-kurullari"
    />
  );
}
export async function getServerSideProps({ query }) {
  return loadBoardDirectory(
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
    query,
  );
}
