export default class CarouselSlider{
  constructor(selector, options){
    let defaultOptions = {
      count: 3,
      buttons: {
        prev: '',
        next: ''
      },
      speed: 3000,
      autoplay: false,
      toRight: false
    }
    this.options = Object.assign(defaultOptions, options);
    this.slider = document.querySelector(selector);
    this.sliderLine = this.slider.querySelector('.slider__line');
    this.slides = this.sliderLine.querySelectorAll('.slide');
    this.sliderInterval
    this.run();
  }

  run(){
    let self = this;

    if(self.options.autoplay){
      self.sliderInterval = setInterval(function(){
        self.options.toRight ? self.prevSlide() : self.nextSlide();
      }, self.options.speed);
    }
    

    document.querySelector(self.options.buttons.next).addEventListener('click', function(){
      self.nextSlide();
      if(self.options.autoplay){
        self.changeSlide();
      }
    });
    document.querySelector(self.options.buttons.prev).addEventListener('click', function(){
      self.prevSlide();
      if(self.options.autoplay){
        self.changeSlide();
      }
    });
  }

  changeSlide(){
    let self = this;
    clearInterval(self.sliderInterval);
    self.sliderInterval = setInterval(function(){
      self.options.toRight ? self.prevSlide() : self.nextSlide();
    }, self.options.speed)
  }

  nextSlide(){
    this.slides = this.sliderLine.querySelectorAll('.slide');
    this.sliderLine.appendChild(this.slides[0])
  }
  prevSlide(){
    this.slides = this.sliderLine.querySelectorAll('.slide');
    this.sliderLine.prepend(this.slides[this.slides.length - 1]);
  }
}