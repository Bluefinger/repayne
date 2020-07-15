+++
date = "2017-03-09T09:00:00Z"
title = "Core-js"
tags = ["javascript", "css", "html5", "webgl"]
[[resources]]
title = "Core-js track data with international dateline fix"
src = "core-js-tracks.jpg"
[[resources]]
title = "Core-js tools panel and track data"
src = "core-js-toolspanel.jpg"
[[resources]]
title = "Core-js ruler tool example"
src = "core-js-ruler.jpg"
[[resources]]
title = "Core-js WebGL course example"
src = "core-js-courses-header.jpg"
[[resources]]
title = "Core-js WebGL Shape editing feature for course data"
src = "core-js-shape-editing.jpg"
+++

Core-js is the internal management system for both [YB Tracking](https://www.ybtracking.com/) and [Rock Seven](http://www.rock7mobile.com/) for handling all of their accounts and trackers, from setting up of races to monitoring of trackers and alerts.

<!--more-->

My work in Core-js revolved around modernising legacy parts of their system, moving various screens into client-side JS and otherwise harmonising the efforts spent to standardise the Core API. The application is built around Google Maps primarily, utilising a WebGL/Three.js overlay for displaying their tracking and position data in a performant manner, as the datasets involved could span into the thousands of positions across many active trackers.

Part of the features I added to Core-js was the refactoring of the shape editing system, creating a standardised interface for all Core geo-objects and implementing editing/display modes that hooked into the WebGL layer for much increased performance. As an extension of this work, the addition of a Ruler function into Core-js to mirror that in [RaceViewer]({{< ref "portfolio/raceviewer.md" >}}) was a fairly straightforward proposal, hooking into the features written into the new layers.

Other notable fixes to legacy issues was solving International Dateline rendering, which required adjusting how the rendering process worked, as well as working out when lines crossed the Dateline and calculating the necessary offsets for seamless transition when panning across the map.
