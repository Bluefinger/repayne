+++
date = "2017-01-09T09:00:00Z"
title = "RaceViewer"
description = "RaceViewer is a mapping application by YB Tracking for the purposes of tracking races and long-distance events"
tags = ["javascript", "canvas2d"]
[[resource]]
title = "Raceviewer application"
src = "raceviewer-header.jpg"
[[resource]]
title = "Raceviewer mapping modes"
src = "raceviewer-mapping-modes.jpg"
[[resource]]
title = "Raceviewer GRIB wind data visualisation"
src = "raceviewer-grib-data.jpg"
[[resource]]
title = "Raceviewer labels in show-all mode"
src = "raceviewer-labels-showall.jpg"
[[resource]]
title = "Raceviewer labels in show-when-possible mode"
src = "raceviewer-labels-showwhenpossible2.jpg"
[[resource]]
title = "Raceviewer map agnostic feature - Leaflet example"
src = "raceviewer-mapping-agnostic.jpg"
[[resource]]
title = "Raceviewer map agnostic night/day and lat/lng overlays"
src = "raceviewer-mapping-agnostic2.jpg"
+++

RaceViewer is a mapping application by [YB Tracking](https://www.ybtracking.com/) for the purposes of tracking and displaying yacht races, adventure races and all sorts of long distance/duration events.

<!--more-->

My work on RaceViewer revolved more around refactoring old legacy code and reworking parts of the application to improve maintainability, add new features and tackle various performance issues with large races or existing features. Part of the reworking of key parts of the RaceViewer was adding the ability to be agnostic with what mapping library was required, allowing for both Google Maps and Leaflet to run at the same time and to cleanly switch between them for a greater array of mapping types and possibilities.

With the map agnostic behaviour, certain features were reworked to be map agnostic or to be able to hook into features that existed in whichever mapping library was being loaded. Day/Night overlay and the Ruler feature were examples of this in how they hooked into both Google Maps and Leaflet cleanly to expose the same functionality to the user.

Performance improvements also came in the rework of Predict Wind overlay, changing how the data is loaded from the feed and then rendered onto the canvas, as well as how to handle mouseover functionality across hundreds or thousands of wind vane icons. Other improvements were done to fix bottlenecks in the position update process, to reduce GC thrashing and better throttle the update calls to allow for quicker rendering particularly in large races.

Other notable feature additions were the Team Number labels, which included the ability to cull overlapping labels to only show those that wouldn't overlap other labels (or were first in the pile) or icons.
