import Link from "next/link";
import { Divider, Paper, Stack, Typography } from "@mui/material";
import {
  formatTermDateRange,
  getChamberSlug,
  getEntityName,
} from "../../lib/boardDirectory";

export default function BoardCard({
  board,
  showChamber = false,
  heading = "h2",
  archived = false,
}) {
  const dates = formatTermDateRange(board.term);
  return (
    <Paper
      elevation={archived ? 0 : 1}
      sx={{ p: 2, ...(archived && { border: 1, borderColor: "divider" }) }}
    >
      <Typography variant="h6" component={heading} sx={{ mb: 1 }}>
        {board.name}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="body2">
          {getEntityName(board.type, "Kurul")}
        </Typography>
        {showChamber && board.chamber && (
          <Typography
            variant="body2"
            component={Link}
            href={`/oda-kurullari/${getChamberSlug(board.chamber)}`}
          >
            {getEntityName(board.chamber)}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {board.term?.name || "Dönem belirtilmemiş"}
        </Typography>
        {dates && (
          <Typography variant="body2" color="text.secondary">
            {dates}
          </Typography>
        )}
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      {board.members?.length ? (
        <Stack spacing={0.5}>
          {board.members.map((member, index) => (
            <Typography key={index} variant="body2">
              {member.title && <strong>{member.title}: </strong>}
              {member.name}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Üye bilgisi bulunamadı.
        </Typography>
      )}
    </Paper>
  );
}
