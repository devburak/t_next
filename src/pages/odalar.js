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
import Chip from "@mui/material/Chip";
import SvgIcon from "@mui/material/SvgIcon";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PublicIcon from "@mui/icons-material/Public";
import Layout from '../component/basic/layout';
import { getChamberSlug } from "../lib/boardDirectory";

const SOCIAL_PLATFORM_META = {
  facebook: { label: "Facebook", color: "#1877F2" },
  instagram: { label: "Instagram", color: "#E4405F" },
  x: { label: "X", color: "#111827" },
  bluesky: { label: "Bluesky", color: "#0285FF" },
  youtube: { label: "YouTube", color: "#FF0033" },
  linkedin: { label: "LinkedIn", color: "#0A66C2" },
  link: { label: "Bağlantı", color: "#64748B" },
};

function BlueskyIcon(props) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M6.335 4.5c2.364 1.11 4.124 3.084 5.665 5.102C13.541 7.584 15.301 5.61 17.665 4.5c1.704-.8 2.944.111 2.52 1.955-.59 2.57-2.13 4.491-4.624 5.763 2.05-.469 3.742-.186 5.076.85 1.194.929 1.112 2.165-.208 2.96-1.1.663-2.385.978-3.855.943-1.92-.047-3.445-.848-4.574-2.403-1.129 1.555-2.654 2.356-4.574 2.403-1.47.035-2.755-.28-3.855-.943-1.32-.795-1.402-2.031-.208-2.96 1.334-1.036 3.026-1.319 5.076-.85-2.494-1.272-4.034-3.193-4.624-5.763-.424-1.844.816-2.755 2.52-1.955Z" />
    </SvgIcon>
  );
}

function detectSocialPlatform(name = "", link = "") {
  const value = `${name} ${link}`.toLowerCase();

  if (value.includes("instagram")) return "instagram";
  if (value.includes("facebook") || value.includes("fb.com")) return "facebook";
  if (value.includes("x.com") || value.includes("twitter")) return "x";
  if (value.includes("bsky") || value.includes("bluesky")) return "bluesky";
  if (value.includes("youtube") || value.includes("youtu.be")) return "youtube";
  if (value.includes("linkedin")) return "linkedin";

  return "link";
}

function SocialPlatformIcon({ platform }) {
  switch (platform) {
    case "facebook":
      return <FacebookIcon sx={{ fontSize: 18 }} />;
    case "instagram":
      return <InstagramIcon sx={{ fontSize: 18 }} />;
    case "x":
      return <XIcon sx={{ fontSize: 18 }} />;
    case "bluesky":
      return <BlueskyIcon sx={{ fontSize: 18 }} />;
    case "youtube":
      return <YouTubeIcon sx={{ fontSize: 18 }} />;
    case "linkedin":
      return <LinkedInIcon sx={{ fontSize: 18 }} />;
    default:
      return <PublicIcon sx={{ fontSize: 18 }} />;
  }
}

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
  return (
    <Layout>
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Odalar
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {chambers.map((chamber) => {
        const chamberSlug = getChamberSlug(chamber);
        const chamberBoardsHref = chamberSlug ? `/oda-kurullari/${chamberSlug}` : "/oda-kurullari";

        return (
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
              <Typography component="div" sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <span>
                  <b>Kısaltma:</b> {chamber.short}
                </span>
                <Chip
                  component={Link}
                  href={chamberBoardsHref}
                  clickable
                  size="small"
                  variant="outlined"
                  color="primary"
                  label="Kurulları"
                  aria-label={`${chamber.short || chamber.name} kurulları`}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    "& .MuiChip-label": { fontWeight: 600 },
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      borderColor: "primary.main",
                    },
                  }}
                />
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
              {chamber.socialMedia && chamber.socialMedia.length > 0 && chamber.socialMedia.some(sm => sm.link) && (
                <Box>
                  <Typography component="div" sx={{ fontWeight: 700 }}>
                    Sosyal Medya:
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                    {chamber.socialMedia.map((sm) => {
                      if (!sm.link) return null;
                      const platform = detectSocialPlatform(sm.name, sm.link);
                      const meta = SOCIAL_PLATFORM_META[platform] || SOCIAL_PLATFORM_META.link;

                      return (
                        <Box
                          key={sm._id || sm.link}
                          component="a"
                          href={sm.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 999,
                            border: "1px solid rgba(15, 23, 42, 0.12)",
                            backgroundColor: "#fff",
                            color: "text.primary",
                            textDecoration: "none",
                            transition: "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
                            "&:hover": {
                              transform: "translateY(-1px)",
                              borderColor: meta.color,
                              boxShadow: `0 10px 24px ${meta.color}1f`,
                            },
                          }}
                          aria-label={`${sm.name || meta.label} profilini yeni sekmede ac`}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: meta.color,
                              backgroundColor: `${meta.color}14`,
                              flex: "0 0 auto",
                            }}
                          >
                            <SocialPlatformIcon platform={platform} />
                          </Box>
                          <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
                            {sm.name || meta.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
        );
      })}
    </Container>
    </Layout>
  );
}
