export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/yayin-turu/birlik-haberleri",
      permanent: false,
    },
  };
}

export default function YayinlarRedirectPage() {
  return null;
}
