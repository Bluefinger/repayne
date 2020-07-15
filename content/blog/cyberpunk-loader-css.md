+++
date = "2018-02-09T13:00:00Z"
title = "How to create your own Cyberpunk Loading Icon"
type = "post"
tags = ["css", "tutorial"]
icon = "css3"
+++

Need something a bit more futuristic and eye-catching for your Website/Web-App loading screen? Bored of a simple little spinner? Let's see how we can take a spinner and flesh it out with a bit CSS and HTML.

<!--more-->

<div class="spinny-container"><div class="spinny-loader"><div class="spinny-circle"></div></div></div>

Now that looks more like it, but how would you go setting this up with only CSS in mind? First off, we require a bit of HTML setup in order to give us the necessary skeleton in order to apply our styles on:

```html
<div class="spinny-loader">
    <div class="spinny-circle"></div>
</div>
```

Just two divs are required so we can get the required number of pseudo-elements as well as the base to hook all our styles to. There are three main visual elements at play, the center circle, the middle ring and the outer ring. Center stays still, middle always rotates in one direction, but the outer ring alternates between directions. Just with that, we've created a visually interesting spinner icon, and the different elements also allows us to apply different spinning behaviours to denote different states.

<div class="spinny-container"><div class="spinny-loader error"><div class="spinny-circle"></div></div><div class="spinny-loader process"><div class="spinny-circle"></div></div></div>

So let's move to the meat of this article: CSS. First off, let's set up the vital ingredient, our CSS animation keyframe:

```css
@keyframes spinny {
  0% {
    transform-origin:50%;
    transform:translate3d(-50%, -50%, 0) rotateZ(0deg);
  }
  100% {
    transform:translate3d(-50%, -50%, 0) rotateZ(360deg);
  }
}
```

Not much to this, we are simply setting up the rotation transformation as being the property to animate, as well as use translate to position our rings. Nothing too complex to this part! Next up, we need to flesh out the loader icon and get some base styles in place in order to get things going:

```css
.spinny-loader {
    display:inline-block;
    position:relative;
    width:140px;
    height:140px;
    margin:0 10px;
}
```

With this, we have set up the container for the loading icon, using `position:relative` to force any further positioning properties in child elements to be relative to the parent div. And in this case, a size limit and block behaviour to allow us to embed it easily into the article.

Now for the circle div which will sit in the middle and otherwise be stationery:

```css
.spinny-loader > div {
    position:absolute;
    top:50%;
    left:50%;
    display:block;
    width:60px;
    height:60px;
    transform: translate3d(-50%, -50%, 0);
    border-radius:200px;
    background-color:#445878;
}
```

Next, we make the rings via pseudo-elements, first defining the shared properties between both rings:

```css
.spinny-loader::before, .spinny-loader::after {
    content:"";
    position:absolute;
    top:50%;
    left:50%;
    display:block;

    border-radius:200px;
    border-style:solid;
    border-width:15px;
    border-color:#445878 transparent #445878 transparent;

    animation-name:spinny;
    animation-duration: 0.6s;
    animation-iteration-count:infinite;
    animation-timing-function: ease-in-out;
}
```

Here we define the positioning of the rings, the style of the rings using borders, and apply to them the animation that we defined earlier. With this, we have established where they'll be and how they'll look. However, the rings still don't know how big they are.

Which then leaves us to simply define those particular attributes between the two elements:

```css
.spinny-loader::after {
    width:140px;
    height:140px;
    animation-direction: alternate-reverse;
}

.spinny-loader::before {
    width:100px;
    height:100px;
}
```

Now each ring has a size, offset and also rather importantly, any tweaks to their animation behaviour that you wish to impose. In the case of our `::after` pseudo-element, its animation starts off in the reverse direction and alternates between forwards and reverse.

With this, we have created our spinning icon! Nothing else needed but instead, we have the means to play around and add further behaviours and features. Perhaps you need the loading icon as an overlay for your screen whilst it loads? Then the container can be tweaked as such:

```css
.spinny-loader {
    position:fixed;
    top:0;
    left:0;
    bottom:0;
    right:0;
    z-index:99;
    background-color:#fff;
    opacity:1;
}
```

Now the container will cover the entire screen and obscure it whilst your site or application loads. Perhaps we need to define an alternate state for our icon?

```css
.spinny-loader.error > div {
    background-color:#ec5840;
}
.spinny-loader.error::before, .spinny-loader.error::after {
    border-color:#ec5840 transparent #ec5840 transparent;
    animation-timing-function: linear;
}
.spinny-loader.error::before {
    animation-duration: 2.5s;
}
.spinny-loader.error::after {
    animation-duration: 3.8s;
    animation-direction: reverse;
}
```

Using the "error" state icon as an example, the changes applied were simply to change the colours of the various elements, as well as modifying the animation behaviours for the rings. Just with a bit of tweaking, we can create the impression of something that isn't right, isn't aligning quite the same and is acting discordant. Further states can be built from this just by tweaking the animation behaviours, though there's nothing to stop one from adding different animations entirely for more creative effects. More rings could be added, the icon made smaller or the rings slimmer.

So with this, we have an icon and potential for further expansion with regards to styles, states and more. Hopefully the provided examples should spur some food for thought and perhaps inspire more creative and eye-catching icons, all without having to touch a single animated GIF.
