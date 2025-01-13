import { DecoratorNode } from 'lexical';
import React from 'react';
import {
  createCommand,
  $insertNodes,
  COMMAND_PRIORITY_EDITOR
} from 'lexical';
import Carousel from 'react-material-ui-carousel';

// CarouselNode bileşeni
class CarouselNode extends DecoratorNode {
  static getType() {
    return 'carousel';
  }

  static clone(node) {
    return new CarouselNode(node.__images);
  }

  constructor(images) {
    super();
    this.__images = images; // Görselleri saklayan özel bir alan
  }

  exportJSON() {
    return {
      type: 'carousel',
      version: 1,
      images: this.__images,
    };
  }

  static importJSON(serializedNode) {
    const { images } = serializedNode;
    return new CarouselNode(images);
  }

  /**
   * 1) exportDOM metodunu ekliyoruz.
   *    $generateHtmlFromNodes() bu metodu çağıracak ve
   *    CarouselNode'un HTML çıktısını elde edecek.
   */
  exportDOM() {
    // Ana container <div>
    const containerDiv = document.createElement('div');
    containerDiv.style.display = 'inline-block';
    containerDiv.style.position = 'relative';
    containerDiv.style.overflow = 'hidden';
    containerDiv.style.maxWidth = '690px';
    containerDiv.style.maxHeight = '400px';
    containerDiv.style.width = '100%';
    containerDiv.style.margin = '0 auto';
    containerDiv.style.verticalAlign = 'middle';

    // İçerikleri tutacak alt <div>
    const innerDiv = document.createElement('div');
    innerDiv.style.display = 'flex';
    innerDiv.style.flexWrap = 'nowrap';
    innerDiv.style.width = `${this.__images.length * 100}%`;
    // Not: Material UI Carousel’in butonlarını vs. burada statik olarak oluşturmak isterseniz
    // kendiniz ek div/button ekleyebilirsiniz. Aşağıda sadece img’leri yerleştiriyoruz.

    // Her görsel için bir <div> + <img> ekleyelim
    this.__images.forEach((src) => {
      const slideDiv = document.createElement('div');
      slideDiv.style.flex = '0 0 100%';
      slideDiv.style.display = 'flex';
      slideDiv.style.justifyContent = 'center';
      slideDiv.style.alignItems = 'center';

      const img = document.createElement('img');
      img.src = src;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'contain';
      slideDiv.appendChild(img);

      innerDiv.appendChild(slideDiv);
    });

    containerDiv.appendChild(innerDiv);

    // Geriye { element: containerDiv } döndürmeliyiz:
    return { element: containerDiv };
  }

  createDOM() {
    // Burada sadece React'te kullanılacak bir placeholder <div> döndürüyoruz
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.width = '100%';
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    // React tarafında, Material UI Carousel ile slide gösterimini sağlıyoruz
    return <MaterialUiCarousel images={this.__images} />;
  }
}

// React bileşeni (react-material-ui-carousel ile oluşturduğumuz)
function MaterialUiCarousel({ images }) {
  const outerContainerStyle = {
    display: 'inline-block',
    position: 'relative',
    maxWidth: '690px',
    maxHeight: '400px',
    width: '100%',
    margin: '0 auto',
    verticalAlign: 'middle',
  };

  return (
    <div style={outerContainerStyle}>
      <Carousel
        autoPlay={true}
        interval={4000}
        navButtonsAlwaysVisible={true}
        cycleNavigation={true}
        animation="slide"
        swipe={true}
        // Material UI Carousel'de height prop'unu ayarlayabilirsiniz
        height="400px"
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              maxHeight: '400px',
              margin: '0 auto',
            }}
          />
        ))}
      </Carousel>
    </div>
  );
}

// Yardımcı fonksiyonlar
export function $createCarouselNode(images) {
  return new CarouselNode(images);
}

export function $isCarouselNode(node) {
  return node instanceof CarouselNode;
}

export const INSERT_CAROUSEL_COMMAND = createCommand('INSERT_CAROUSEL_COMMAND');

export function registerCarouselCommand(editor) {
  return editor.registerCommand(
    INSERT_CAROUSEL_COMMAND,
    (payload) => {
      const carouselNode = $createCarouselNode(payload.images);
      $insertNodes([carouselNode]);
      return true;
    },
    COMMAND_PRIORITY_EDITOR
  );
}

export default CarouselNode;
