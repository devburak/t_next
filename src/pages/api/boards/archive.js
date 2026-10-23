import { fetchBoardArchive } from "../../../lib/boardArchive";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Bu işlem desteklenmiyor." });
  }
  try {
    const result = await fetchBoardArchive(
      process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
      req.query,
    );
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.status === 400 ? 400 : 502)
      .json({
        error:
          error.status === 400
            ? "Geçersiz arşiv filtresi."
            : "Kurul arşivi şu anda yüklenemiyor. Lütfen yeniden deneyin.",
      });
  }
}
