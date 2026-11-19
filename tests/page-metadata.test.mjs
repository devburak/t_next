import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPagePath, homeStructuredData, serializeJsonLd, SITE_NAME } from '../src/lib/pageMetadata.mjs';

test('pagination is self-canonical, first-page aliases and fragments are removed',()=>{
 assert.equal(canonicalPagePath('/video-galeri?page=99#başlık',2),'/video-galeri?page=2');
 assert.equal(canonicalPagePath('/video-galeri?page=1',1),'/video-galeri');
 assert.equal(canonicalPagePath('/yayin-turu/birlik-haberleri',3),'/yayin-turu/birlik-haberleri?page=3');
 assert.throws(()=>canonicalPagePath('//attacker.example/path',1),/Local canonical/);
});
test('organization and website URLs follow the configured domain without fabricated video dates',()=>{
 for(const base of ['https://tmmob.org.tr','https://newt6491032g.tmmob.org.tr']){
  const data=homeStructuredData(base);assert.equal(data['@graph'].length,2);assert.equal(data['@graph'][0].name,SITE_NAME);
  assert.equal(data['@graph'][1].url,base);assert.equal(data['@graph'][1].publisher['@id'],`${base}/#organization`);
  assert(!JSON.stringify(data).includes('uploadDate'));
 }
});
test('JSON-LD preserves content while preventing closing-script injection',()=>{
 const data={name:'</script><script>alert(1)</script>\u2028\u2029'};const result=serializeJsonLd(data);
 assert(!result.includes('<'));assert(!result.includes('\u2028'));assert(!result.includes('\u2029'));assert.deepEqual(JSON.parse(result),data);
});
