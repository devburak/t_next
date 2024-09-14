import React from 'react';

const meslekOdasiLogolari = [
    { href: "http://bmo.org.tr", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/bmo-logo-1-rgb-transparent-armali.jpg?itok=dlzQtkW7", alt: "BMO Logo" },
    { href: "http://cmo.org.tr", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/CMO.jpg?itok=PzotMx-0", alt: "CMO Logo" },
    { href: "http://www.emo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/emo_logo_13.jpg?itok=dbsgKHDy", alt: "EMO Logo" },
    { href: "http://www.fmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/fizik_logo.jpg?itok=o0v7yFOK", alt: "FMO Logo" },
    { href: "http://www.gemimo.org/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/gemimo_logo_son_tasarim.jpg?itok=2QYhaoEo", alt: "GEMIMO Logo" },
    { href: "http://www.gmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/gemi_logo_0.jpg?itok=qa-oOSZ7", alt: "GMO Logo" },
    { href: "http://www.gidamo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/gidamo-logo_0.png?itok=ZhhlZpQ3", alt: "GIDAMO Logo" },
    { href: "http://www.hkmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/hkmo_logo.jpg?itok=3KRABEw8", alt: "HKMO Logo" },
    { href: "http://www.icmimarlarodasi.org.tr", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/icmimar_logo_converted_copy.jpg?itok=F7KPLlSU", alt: "ICMIMAR Logo" },
    { href: "http://www.imo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/imo_logo.jpg?itok=7v5FM_5D", alt: "IMO Logo" },
    { href: "http://www.jeofizik.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/jeofizik.jpg?itok=doLHs_da", alt: "JEOFIZIK Logo" },
    { href: "http://www.jmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/jmo_logo_oval.png?itok=l3Jgq6J1", alt: "JMO Logo" },
    { href: "http://www.kmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/kimya_logo.jpg?itok=gEXVN8x6", alt: "KMO Logo" },
    { href: "http://www.maden.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/maden.muh_.oda-logo.jpg?itok=oWs5sO-G", alt: "MADEN Logo" },
    { href: "http://www.mmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/makina_logo.jpg?itok=u0hAVcdn", alt: "MMO Logo" },
    { href: "http://www.metalurji.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/metalurji_logo.jpg?itok=7TSvF2xj", alt: "METALURJI Logo" },
    { href: "http://www.meteoroloji.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/meteoroloji.jpg?itok=i_fUgH0T", alt: "METEOROLOJI Logo" },
    { href: "http://www.mimarlarodasi.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/mimarlar_logo.jpg?itok=LWGGAh_k", alt: "MIMARLAR Logo" },
    { href: "http://ormuh.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/orman_logo.jpg?itok=_ZGh7FXA", alt: "ORMUH Logo" },
    { href: "http://pmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/petrol_logo.jpg?itok=dvxuX_7-", alt: "PMO Logo" },
    { href: "http://www.peyzajmimoda.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/peyzaj_logo_yeni.jpg?itok=BY3UGODT", alt: "PEYZAJMIMODA Logo" },
    { href: "http://www.spo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/spo_logo_5.jpg?itok=Gp7tGRIp", alt: "SPO Logo" },
    { href: "http://www.tmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/tekstil_logo.jpg?itok=sd2qWh2X", alt: "TMO Logo" },
    { href: "http://www.zmo.org.tr/", src: "https://www.tmmob.org.tr/sites/default/files/styles/footer_logo/public/zmologo.jpg?itok=-g0t8sHm", alt: "ZMO Logo" }
  ];
  
  function Chambers() {
    return (
      <section className="block block-views clearfix">
        <div className="view view-footer-oda-logolari">
          <div className="view-content" style={{
            marginBottom: 10,
            display: "flex",
            flexWrap: "nowrap",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 25,
            paddingLeft: 20,
            paddingRight: 20
          }}>
            {meslekOdasiLogolari.map((oda, index) => (
              <div key={index} className={`views-row ${index % 2 === 0 ? 'views-row-odd' : 'views-row-even'}`}>
                <div className="views-field views-field-field-amblem">
                  <div className="field-content">
                    <a href={oda.href}>
                      <img
                        className="img-responsive img-hover-grow" // Buraya img-hover-grow sınıfını ekleyin
                        src={oda.src}
                        width="37"
                        height="37"
                        alt={oda.alt}
                      />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

export default Chambers;
