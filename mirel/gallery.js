(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.mirel-gallery').forEach(function (gallery) {
      const slider = gallery.querySelector('.mirel-product-swiper');
      const thumbs = gallery.querySelectorAll('[data-gallery-index]');
      if (!slider || typeof window.Swiper !== 'function') return;
      const swiper = new window.Swiper(slider, {
        navigation: {
          prevEl: slider.querySelector('.swiper-button-prev'),
          nextEl: slider.querySelector('.swiper-button-next'),
        },
        keyboard: { enabled: true, onlyInViewport: true },
        on: {
          slideChange: function () {
            thumbs.forEach((button, index) => button.setAttribute('aria-pressed', String(index === this.activeIndex)));
          },
        },
      });
      thumbs.forEach((button) => button.addEventListener('click', () => swiper.slideTo(Number(button.dataset.galleryIndex))));
    });
  });
})();
