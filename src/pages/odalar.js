// /src/pages/odalar.js
import * as React from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import Image from "next/image";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { useMemo } from "react";
import Layout from '../component/basic/layout';
// SSR fonksiyonu: veriyi sunucu tarafında çeker
export async function getServerSideProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chambers`);
  const data = await res.json();

  // Hata veya veri yoksa
  if (!data || !data.data) {
    return { props: { chambers: [] } };
  }
  return { props: { chambers: data.data } };
}

export default function OdalarPage({ chambers }) {
  // Social medya ikonu göstermek için isteğe bağlı küçük bir yardımcı
  const socialIcon = (name) => {
    if (!name) return null;
    if (name.toLowerCase().includes("facebook")) return "🌐";
    if (name.toLowerCase().includes("instagram")) return "📸";
    if (name.toLowerCase().includes("x") || name.toLowerCase().includes("twitter")) return "𝕏";
    return "🔗";
  };

  return (
    <Layout>
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Odalar
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {chambers.map((chamber) => (
        <Accordion key={chamber._id} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${chamber._id}-content`}
            id={`panel-${chamber._id}-header`}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              {/* Logo */}
              <Box
                sx={{
                  minWidth: 70,
                  minHeight: 70,
                  width: 70,
                  height: 70,
                  mr: 2,
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: 1,
                  background: "#fff"
                }}
              >
                <Image
                  src={chamber.logo?.url || "/no-image.png"}
                  alt={chamber.short || chamber.name}
                  width={70}
                  height={70}
                  style={{ objectFit: "contain" }}
                />
              </Box>
              {/* Oda ismi */}
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold", ml: 2 }}
              >
                {chamber.name}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <Typography>
                <b>Kısaltma:</b> {chamber.short}
              </Typography>
              <Typography>
                <b>Adres:</b> {chamber.contact?.address}
              </Typography>
              <Typography>
                <b>Telefon:</b> {chamber.contact?.phone}
              </Typography>
              <Typography>
                <b>E-posta:</b>{" "}
                <a href={`mailto:${chamber.contact?.email}`}>
                  {chamber.contact?.email}
                </a>
              </Typography>
              <Typography>
                <b>Web Sitesi:</b>{" "}
                <Link href={chamber.website} target="_blank">
                  {chamber.website}
                </Link>
              </Typography>
              <Typography>
                <b>Sosyal Medya:</b>
                {chamber.socialMedia && chamber.socialMedia.length > 0 && chamber.socialMedia.some(sm => sm.link) ? (
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    {chamber.socialMedia.map((sm) =>
                      sm.link ? (
                        <a
                          key={sm._id}
                          href={sm.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {socialIcon(sm.name)}{" "}
                          <span style={{ marginLeft: 4, fontSize: 14 }}>
                            {sm.name || sm.link}
                          </span>
                        </a>
                      ) : null
                    )}
                  </Stack>
                ) : (
                  <span> Bilgi yok</span>
                )}
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
    </Layout>
  );
}