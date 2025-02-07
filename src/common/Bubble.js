export default class Bubble{
  constructor(selector, options){
    let defaultOptions = {
      count: 10,
      range: {
        from: 50,
        to: 200
      },
      class: 'a',
      delays: 2,
      isBottom: true,
    }

    this.options = Object.assign(defaultOptions, options);
    this.bubbleBlock = document.querySelector(selector);
    this.parentBubbleBlock = this.bubbleBlock.parentNode;
    this.pageHeight = this.parentBubbleBlock.offsetHeight;
    this.createBubbles();
  }

  getRandomInt() {
    let min = Math.ceil(this.options.range.from);
    let max = Math.floor(this.options.range.to);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  createBubble(n){
    let bubble = document.createElement('div');
    bubble.classList.add('bubble', `${this.options.class}${n}`);
    return bubble
  }
  createBubbles(){
    let leftOffset = 0;
    let animationDelay = 0;
    let animationDelayStep = 10;
    let animationDuration = 20;
    let topOffset = 0;

    for(let i = 1; i <= this.options.count; i++){
      let bubble = this.createBubble(i);
      leftOffset += 20;

      if(leftOffset > 80){
        leftOffset = 10;
      }

      if(this.options.isBottom){
        bubble.style.animationDelay = `${animationDelay}s`;
        animationDelay += animationDelayStep;
  
        if(animationDelay > (this.options.count * animationDelayStep / this.options.delays)){
          animationDelay = animationDelayStep / this.options.delays;
        }
      }else{
        topOffset += 100 / this.options.count;
        animationDuration += 100 / this.options.count;
        bubble.style.top = `${topOffset}%`;
        bubble.style.animationDuration = `${animationDuration}s`;
      }

      let wh = this.getRandomInt();

      bubble.style.left = `${leftOffset}vw`;
      bubble.style.width = `${wh}px`;
      bubble.style.height = `${wh}px`;

      this.bubbleBlock.append(bubble);
    }
  }
}


let b1 = new Bubble('#bubbles-bottom', {
  count: 20,
  class: 'b'
});

let b2 = new Bubble('#bubbles-1', {
  class: 'a',
  isBottom: false,
})