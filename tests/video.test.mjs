import test from 'node:test';
import assert from 'node:assert/strict';
import { videoEmbedUrl, videoThumbnail } from '../src/lib/video.mjs';
test('Vimeo ve YouTube oynatma listeleri doğru oynatıcıya açılır', () => {
  assert.equal(videoEmbedUrl({provider:'vimeo',videoId:'98010466'}),'https://player.vimeo.com/video/98010466');
  assert.equal(videoEmbedUrl({provider:'youtube-playlist',videoId:'PLBidn3zx5zf9Ms94DGGEpDz7jgh0-jyTq'}),'https://www.youtube.com/embed/videoseries?list=PLBidn3zx5zf9Ms94DGGEpDz7jgh0-jyTq');
  assert.equal(videoEmbedUrl({provider:'youtube',videoId:'BboCUmVWF8A'}),'https://www.youtube.com/embed/BboCUmVWF8A');
});
test('güvenilmeyen gömme kodu ve bozuk kimlik kullanılamaz', () => {
  assert.equal(videoEmbedUrl({provider:'other',embedCode:'<script>alert(1)</script>'}),null);
  assert.equal(videoEmbedUrl({provider:'vimeo',videoId:'1?x=<script>'}),null);
});
test('Vimeo için YouTube resmi üretilmez, aktarılan küçük resim kullanılır', () => {
  assert.equal(videoThumbnail({provider:'vimeo',videoId:'123'},'/fallback.jpg'),'/fallback.jpg');
  assert.equal(videoThumbnail({provider:'vimeo',thumbnailUrl:'https://storage.example/image.jpg'},'/fallback.jpg'),'https://storage.example/image.jpg');
});
