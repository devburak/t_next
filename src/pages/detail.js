import { serialize } from '../component/LX/NewRichTextParser';
import Layout from '@/component/basic/layout';
import LexicalJSONRenderer from  '../component/LX/LexicalJSONRenderer';

function DetailPage() {
    // Örnek veri yapınızı buraya yerleştirin
    const data =   {
        "_id": "65bdb846a0ae9a1bb4734dfe",
        "title": "HKMO: ANAYASAL DÜZENİ YOK SAYAN ANLAYIŞIN KARŞISINDAYIZ",
        "slug": "hkmo-anayasal-duzeni-yok-sayan-anlayisin-karsisindayiz",
        "categories": [
            {
                "_id": "65bd790e6edf77b16ef450b6",
                "slug": "oda-haberleri"
            }
        ],
        "status": "published",
        "publishedDate": "2024-02-02T03:48:48.000Z",
        "tags": [],
        "images": [
            {
                "_id": "65bdb7e7a0ae9a1bb4734dee",
                "fileName": "hkmo_01q.jpeg",
                "size": 96968,
                "mimeType": "image/jpeg",
                "fileUrl": "https://storage.ikon-x.com.tr/2024/02/hkmo_01q.jpeg",
                "thumbnailUrl": "https://storage.ikon-x.com.tr/thumbnails/2024/02/th_hkmo_01q.webp",
                "path": "2024/02"
            }
        ],
        "summary": "TMMOB Harita ve Kadastro Mühendisleri Odası, Hatay Milletvekili Can Atalay’ın vekilliğinin 30 Ocak 2024 tarihinde düşürülmesine ilişkin 1 Şubat 2024 tarihinde b",
        "period": {
            "_id": "65bd8deecfbf7882907d1f9b",
            "name": "47",
            "startDate": "2022-06-01T00:49:55.000Z",
            "endDate": "2024-05-31T21:00:00.000Z"
        },
        "createdBy": {
            "_id": "65287906b4dbebbd2f0a45d8",
            "name": "ADMIN"
        },
        "root": {
            "children": [
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "TMMOB Harita ve Kadastro Mühendisleri Odası, Hatay Milletvekili Can Atalay’ın vekilliğinin 30 Ocak 2024 tarihinde düşürülmesine ilişkin 1 Şubat 2024 tarihinde bir basın açıklaması yaptı.",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "justify",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 1,
                            "mode": "normal",
                            "style": "",
                            "text": "ANAYASAL DÜZENİ YOK SAYAN ANLAYIŞIN KARŞISINDAYIZ",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "justify",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "Daha önce hakkında verilen beraat kararına rağmen yargıya yapılan müdahaleler sonucu tekrar açılan dava neticesinde ceza alan Can Atalay, depremzede Hatay halkının oyları ile milletvekili seçilmiş; ancak Anayasa Mahkemesinin iki kez hak ihlali kararı vermesine rağmen Atalay’ın tahliyesi gerçekleşmemişti. ",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "justify",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "Anayasa Mahkemesi kararları yok sayılarak Yargıtay 3. Ceza Dairesinin hukuk dışı kararı 30.01.2024 tarihinde Türkiye Büyük Millet Meclisinde okundu, hukuka aykırı uygulamalara devam edilerek Can Atalay’ın milletvekilliği düşürüldü. ",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "justify",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "Can Atalay’ın milletvekilliğinin düşürülmesi; Hatay halkının seçme iradesinin yok sayılmasının yanı sıra Anayasa’nın da açıkça yok sayılması, demokrasinin ve hukukun alenen görmezden gelinmesi demektir. Anayasal düzeni korumakla görevli olan Meclis’in Anayasa’yı tanımaması, kabul edilebilir değildir. ",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "justify",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "Can Atalay; Gezi, Ermenek, Soma, Çorlu gibi pek çok toplumsal olayın yakın takipçisi olmuş, bu olayların davalarında mağdurların tarafında durarak avukatlık yapmış, haksızlığa, hukuksuzluğa karşı her zaman sesini çıkarmıştır. Hukuku yok sayarak alınan bu gibi siyasi kararların toplumun vicdanını yaralamasının yanı sıra adalete olan incancı, ekonomiyi, meslek alanlarımızı, kentlerimizi, yaşam alanlarımızı ve toplumsal yaşamın her alanını aşındırdığı aşikardır. ",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "justify",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 0,
                            "mode": "normal",
                            "style": "",
                            "text": "Harita ve Kadastro Mühendisleri Odası olarak hukukun üstünlüğünün her koşulda ve herkes tarafından savunulması gerektiğini, hukuk dışı bu uygulamanın tarihe kara bir leke olarak geçtiğini vurgulayarak Hatay halkının iradesinin, demokrasinin, Anayasa’nın, hukukun yok sayılmasının tam karşısında olduğumuzu ve Anayasal düzenin korunması için her zaman sesimizi yükseltmeye devam edeceğimizi yineliyoruz. ",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "justify",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 1,
                            "mode": "normal",
                            "style": "",
                            "text": "TMMOB ",
                            "type": "text",
                            "version": 1
                        },
                        {
                            "type": "linebreak",
                            "version": 1
                        },
                        {
                            "detail": 0,
                            "format": 1,
                            "mode": "normal",
                            "style": "",
                            "text": "Harita ve Kadastro Mühendisleri Odası",
                            "type": "text",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "center",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "detail": 0,
                            "format": 1,
                            "mode": "normal",
                            "style": "",
                            "text": "  ",
                            "type": "text",
                            "version": 1
                        },
                        {
                            "altText": "hkmo-logo.webp",
                            "caption": {
                                "editorState": {
                                    "root": {
                                        "children": [],
                                        "direction": null,
                                        "format": "",
                                        "indent": 0,
                                        "type": "root",
                                        "version": 1
                                    }
                                }
                            },
                            "height": 0,
                            "maxWidth": 500,
                            "showCaption": false,
                            "src": "https://storage.ikon-x.com.tr/2024/02/hkmo-logo.webp",
                            "type": "image",
                            "version": 1,
                            "width": 0
                        }
                    ],
                    "direction": null,
                    "format": "center",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                },
                {
                    "children": [
                        {
                            "type": "linebreak",
                            "version": 1
                        }
                    ],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "paragraph",
                    "version": 1
                }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1
        },
        "createdAt": "2024-02-03T03:51:34.486Z",
        "updatedAt": "2024-02-03T03:51:34.486Z",
        "__v": 0,
        "id": "65bdb846a0ae9a1bb4734dfe"
    };
  
    const r = data.root.children
    // const htmlContentRx = serialize(r)
    const content = LexicalJSONRenderer(data.root)
    console.log(content)

    return (
        <Layout>
            <h1>{data.title}</h1>
            <img src={data.images[0].fileUrl} alt={data.title} style={{ maxWidth: '100%' }} />
            <p>{data.summary}</p>
            {/* <div>
                {data.root.children.map((paragraph, index) => (
                    <p key={index} style={{ textAlign: paragraph.format === "justify" ? "justify" : "left" }}>
                        {paragraph.children.map((text, textIndex) => {
                            // `format` değerine göre metni kalın veya normal olarak renderla
                            return text.format === 1 ? (
                                <strong key={textIndex}>{text.text}</strong>
                            ) : (
                                <span key={textIndex}>{text.text}</span>
                            );
                        })}
                    </p>
                ))}
            </div> */}
            <div>
                {/* {htmlContentRx.map((htmlContent, index) => (
                    <div key={index} dangerouslySetInnerHTML={{ __html: htmlContent }} />
                ))} */}
                {content}
            </div>
  
        </Layout>
    );
  }
  
  export default DetailPage;
  