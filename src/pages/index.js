import PageMetadata from "../component/basic/PageMetadata";
import { SITE_NAME, homeStructuredData } from "../lib/pageMetadata.mjs";
import { getSiteUrl } from "../lib/seo";
import HomePage from "@/component/basic/homeLayout";
import { DEFAULT_META_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getServerCampaigns } from "@/lib/campaignCache";
import { getServerMainMenu } from "@/lib/mainMenuCache";
import { getServerRightMenu } from "@/lib/rightMenuCache";

const HOME_NEWS_CONFIG = [
  { key: "haberler", slug: "haberler", limit: 6 },
  { key: "basin-aciklamalari", slug: "basin-aciklamalari", limit: 6 },
  { key: "oda-haberleri", slug: "oda-haberleri", limit: 6 },
  { key: "ikk-haberleri", slug: "ikk-haberleri", limit: 6 },
  { key: "gorusler", slug: "gorusler", limit: 4 },
  { key: "etkinlik-acilis-konusmalari", slug: "etkinlik-acilis-konusmalari", limit: 4 },
];

const HOME_PUBLICATION_CONFIG = [
  { key: "birlik-haberleri", slug: "birlik-haberleri" },
  { key: "kitap", slug: "kitap" },
];

function getApiBaseUrl() {
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

function toSerializable(value, fallbackValue) {
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized === "undefined") {
      return fallbackValue;
    }
    return JSON.parse(serialized);
  } catch (error) {
    return fallbackValue;
  }
}

async function fetchJson(url, fallbackValue, label) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[index] Failed to fetch ${label}:`, response.status, response.statusText);
      return fallbackValue;
    }
    return await response.json();
  } catch (error) {
    console.error(`[index] Failed to fetch ${label}:`, error);
    return fallbackValue;
  }
}

function getMediaUrl(media) {
  if (!media) {
    return "";
  }
  if (typeof media === "string") {
    return media;
  }
  if (typeof media.url === "string" && media.url) {
    return media.url;
  }
  if (Array.isArray(media.thumbnails) && media.thumbnails.length > 0) {
    const thumbnail = media.thumbnails.find((entry) => entry && entry.url);
    if (thumbnail?.url) {
      return thumbnail.url;
    }
  }
  return "";
}

function formatHomeNewsItem(content) {
  return {
    image: getMediaUrl(content?.featuredMedia),
    title: content?.title || "",
    url: content?.slug ? `/${content.slug}` : "/",
    publishDate: content?.publishDate || null,
  };
}

async function getServerHomeSlides(apiBaseUrl, limit = 5) {
  const payload = await fetchJson(
    `${apiBaseUrl}/contents/category/slide?limit=${limit}`,
    { contents: [] },
    "home-slides"
  );
  return Array.isArray(payload?.contents) ? payload.contents : [];
}

async function getServerHomeNews(apiBaseUrl) {
  const entries = await Promise.all(
    HOME_NEWS_CONFIG.map(async ({ key, slug, limit }) => {
      const payload = await fetchJson(
        `${apiBaseUrl}/contents/category/${slug}?limit=${limit}`,
        { contents: [] },
        `news:${slug}`
      );
      const contents = Array.isArray(payload?.contents) ? payload.contents : [];
      return [key, contents.map(formatHomeNewsItem)];
    })
  );

  return Object.fromEntries(entries);
}

async function getServerHomePublications(apiBaseUrl) {
  const entries = await Promise.all(
    HOME_PUBLICATION_CONFIG.map(async ({ key, slug }) => {
      const params = new URLSearchParams({
        page: "1",
        limit: "3",
        categorySlug: slug,
      });

      const payload = await fetchJson(
        `${apiBaseUrl}/publication?${params.toString()}`,
        { data: [] },
        `publication:${slug}`
      );

      const data = Array.isArray(payload?.data) ? payload.data : [];
      return [key, { ...payload, data }];
    })
  );

  return Object.fromEntries(entries);
}

async function getServerHomeVideos(apiBaseUrl, limit = 3) {
  const payload = await fetchJson(
    `${apiBaseUrl}/videos?limit=${limit}`,
    { videos: [] },
    "videos"
  );

  return Array.isArray(payload?.videos) ? payload.videos : [];
}

export default function Home({
  initialSlides = [],
  initialMainMenuItems = null,
  initialRightMenuItems = null,
  initialNewsData = {},
  initialPublicationData = {},
  initialVideoData = null,
}) {

  return (
    <>
      <PageMetadata title={`TMMOB | ${SITE_NAME}`} description={DEFAULT_META_DESCRIPTION} path="/" image={initialSlides[0]?.featuredMedia?.url || DEFAULT_OG_IMAGE} jsonLd={homeStructuredData(getSiteUrl())} />
      <HomePage
        initialSlides={initialSlides}
        initialMainMenuItems={initialMainMenuItems}
        initialRightMenuItems={initialRightMenuItems}
        initialNewsData={initialNewsData}
        initialPublicationData={initialPublicationData}
        initialVideoData={initialVideoData}
      />
    </>
  );
}

export async function getStaticProps() {
  try {
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      return {
        props: {
          campaigns: [],
          initialSlides: [],
          initialMainMenuItems: null,
          initialRightMenuItems: null,
          initialNewsData: {},
          initialPublicationData: {},
          initialVideoData: [],
        },
        revalidate: 120,
      };
    }

    const [
      campaigns,
      initialSlides,
      mainMenu,
      rightMenu,
      initialNewsData,
      initialPublicationData,
      initialVideoData,
    ] = await Promise.all([
      getServerCampaigns(),
      getServerHomeSlides(apiBaseUrl, 5),
      getServerMainMenu(),
      getServerRightMenu(),
      getServerHomeNews(apiBaseUrl),
      getServerHomePublications(apiBaseUrl),
      getServerHomeVideos(apiBaseUrl, 3),
    ]);

    return {
      props: {
        campaigns: toSerializable(campaigns || [], []),
        initialSlides: toSerializable(initialSlides, []),
        initialMainMenuItems: toSerializable(
          Array.isArray(mainMenu?.items) ? mainMenu.items : null,
          null
        ),
        initialRightMenuItems: toSerializable(
          Array.isArray(rightMenu?.items) ? rightMenu.items : null,
          null
        ),
        initialNewsData: toSerializable(initialNewsData, {}),
        initialPublicationData: toSerializable(initialPublicationData, {}),
        initialVideoData: toSerializable(initialVideoData, []),
      },
      revalidate: 120,
    };
  } catch (error) {
    console.error('[index] Failed to fetch campaigns:', error);
    return {
      props: {
        campaigns: [],
        initialSlides: [],
        initialMainMenuItems: null,
        initialRightMenuItems: null,
        initialNewsData: {},
        initialPublicationData: {},
        initialVideoData: [],
      },
      revalidate: 120,
    };
  }
}
