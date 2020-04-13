# Reittiopas_frontend

Frontend part of the solution to Solidabis coding challenge 2020

Software was written with VSCode on Windows.
Written using HTML5, CSS3, JQuery, and Bootstrap.
SVG:s were taken from problem page https://koodihaaste.solidabis.com/

Best routes are calculated using own implementation of Floyd-Warshall algorithm 
https://en.wikipedia.org/wiki/Floyd-Warshall_algorithm

Software can be seen running in: http://www.cleanprogramming.com/reittihaku/

## Installation

Clone the repo into the root folder on a web server. 

## Usage

Allows the user to choose starting and end busstops and calculates and shows the fastest route and the total time taken.
Route is shown as letters and colors, and with map marks.
User can choose start and end busstops by clicking on the map, or by clicking buttons on the top of the page. On smallest mobile devices, only clicking the map is an option for clearer usage and layout.

Backend part updates the served json.js file, so frontend is up to date if route info 
on https://koodihaaste.solidabis.com/reittiopas.json changes.
If some stops are removed, times between stops change, or bus routes change, page is kept up to date automatically.
Map picture and app.js img_stop_coordinates variable need to be manually updated. 

Solution doesn't minimize vehicle changes between buslines.

## License

Copyright © 2020 Markus Kiili

This program and the accompanying materials are made available under the
terms of the Eclipse Public License 2.0 which is available at
http://www.eclipse.org/legal/epl-2.0.

This Source Code may also be made available under the following Secondary
Licenses when the conditions for such availability set forth in the Eclipse
Public License, v. 2.0 are satisfied: GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or (at your
option) any later version, with the GNU Classpath Exception which is available
at https://www.gnu.org/software/classpath/license.html.
