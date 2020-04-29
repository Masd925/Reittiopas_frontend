$(function() {
    try {

        var img_stop_coordinates = { // Left and top coordinates of busstops on image
            A: [6.8, 87],
            B: [26.8, 87],
            C: [6.8, 70],
            D: [19, 70],
            E: [19, 58.5],
            F: [30, 48.3],
            G: [45, 40.5],
            H: [39.2, 23.8],
            I: [50, 23.8],
            J: [53.3, 8],
            K: [86.7, 27],
            L: [86.6, 38.3],
            M: [86.6, 51.5],
            N: [86.6, 67.5],
            O: [86.6, 80.2],
            P: [80, 92],
            Q: [72.3, 80.2],
            R: [47, 70.2]
        };

        var hoverOnLimit = 600;
        var routes = JSON.parse(reittiopasJsonTxt);
        var nodeNames = routes.pysakit; // ["A", "B", ..., "R"]
        var nodes = nodeNames.map(function(elem, index) { return index; }); // [0,1,...,17]
        var roads = routes.tiet;
        var busLines = routes.linjastot;

        function nodeIndex(nodeName) {
            return nodeNames.indexOf(nodeName);
        }

        var roadTraverseTimes = nodes.reduce(function(acc, curr) { // {A: {B:3,...},...}
            acc[curr] = {};
            return acc;
        }, {});

        roads.forEach(function(road) {
            var from = road.mista;
            var to = road.mihin;
            var duration = road.kesto;
            roadTraverseTimes[nodeIndex(from)][nodeIndex(to)] = duration;
            roadTraverseTimes[nodeIndex(to)][nodeIndex(from)] = duration;
        });

        var traverseTimes = nodes.reduce(function(acc, curr) { // Considers not roads but bus line connections only
            acc[curr] = {};
            return acc;
        }, {});

        var roadColors = nodes.reduce(function(acc, curr) { // {A: {B:"vihreä",...},...}
            acc[curr] = {};
            return acc;
        }, {});

        Object.keys(busLines).forEach(function(color) {
            var nodes = busLines[color].map(nodeIndex);
            for (var i = 0; i < nodes.length - 1; i++) {
                var first = nodes[i];
                var second = nodes[i + 1];
                traverseTimes[first][second] = roadTraverseTimes[first][second];
                traverseTimes[second][first] = roadTraverseTimes[second][first];
                roadColors[first][second] = color;
                roadColors[second][first] = color;
            }
        });

        function fastestRoutes(traverseTimes) { // Uses Floyd-Warshall algorithm to solve all best routes 
            var nodes = Object.keys(traverseTimes).map(Number);
            var nNodes = nodes.length;
            var routeDuration = nodes.map(function(elem) {
                return nodes.slice().map(function() { return Infinity; });
            });
            var nextNode = nodes.map(function(elem) {
                return nodes.slice().map(function() { return null; });
            });
            nodes.forEach(function(node) {
                Object.keys(traverseTimes[node]).forEach(function(neighbour) {
                    routeDuration[node][neighbour] = traverseTimes[node][neighbour];
                    nextNode[node][neighbour] = Number(neighbour);
                });
                routeDuration[node][node] = 0;
                nextNode[node][node] = node;
            });
            for (k = 0; k < nNodes; k++) {
                for (i = 0; i < nNodes; i++) {
                    for (j = 0; j < nNodes; j++) {
                        if (routeDuration[i][j] > routeDuration[i][k] + routeDuration[k][j]) {
                            routeDuration[i][j] = routeDuration[i][k] + routeDuration[k][j];
                            nextNode[i][j] = nextNode[i][k];
                        }
                    }
                }
            }

            function bestPath(source, destination) { // Only minimal amount of information (nextNode) is stored for memory efficiency
                var nodes = [source]; //                This function gets the best route from stored information
                var node = source;
                while (node !== destination) {
                    node = nextNode[node][destination];
                    if (node === null) return null;
                    nodes.push(node);
                }
                return { nodes: nodes, totalTime: routeDuration[source][destination] };
            }

            return { bestPath: bestPath, routeDuration: routeDuration };
        }

        var generateRoutes = fastestRoutes(traverseTimes);
        var routeGenerator = generateRoutes.bestPath;
        var routeDuration = generateRoutes.routeDuration;

        var mista = $('#mista');
        var mihin = $('#mihin');
        var reitti = $('#reitti');
        var hover_route_info = $("#hover_route_info");

        var hoverDelay = 150;
        var chosen_mista = 0;
        var chosen_mihin = 10;
        var isHoveringInfo = false;

        updateRoute();

        nodes.forEach(function(node) {
            var nodeButtonContainer = $('<div></div>').addClass("nodeButtonContainer");
            nodeButtonContainer.attr("id", "mista" + node).addClass("buttons");
            var nodeElem = $('<span>' + nodeNames[node] + '</span>').addClass("nodeElem");
            nodeButtonContainer.append(nodeElem);
            mista.append(nodeButtonContainer);

            nodeButtonContainer = $('<div></div>').addClass("nodeButtonContainer");
            nodeButtonContainer.attr("id", "mihin" + node).addClass("buttons");
            nodeElem = $('<span>' + nodeNames[node] + '</span>').addClass("nodeElem");
            nodeButtonContainer.append(nodeElem);
            mihin.append(nodeButtonContainer);
        });

        function changeNodeHighlight(rowName, node, isAdded) {
            console.log("highlight", rowName, node, isAdded);
            if (isAdded) $('#' + rowName + node).addClass("highlight");
            else $('#' + rowName + node).removeClass("highlight");
        }

        $("#content-panel").on('click', panel_clickHandler);

        function panel_clickHandler(e) {
            var id = $(e.target).attr("id");
            if (id === undefined) id = $(e.target).parent().attr("id");
            if (id !== undefined && id.length > 5) {
                var rowName = id.slice(0, 5);
                if (rowName === "mista" || rowName === "mihin") {
                    node = Number(id.slice(5));
                    pressed(rowName, node);
                }
            }
        }

        function pressed(rowName, node) {
            if (rowName === "mista" && node !== chosen_mista && node !== chosen_mihin) {
                changeNodeHighlight("mista", chosen_mista, false);
                changeNodeHighlight("mista", node, true);
                chosen_mista = node;
                updateRoute();
            }
            if (rowName === "mihin" && node !== chosen_mihin && node !== chosen_mista) {
                changeNodeHighlight("mihin", chosen_mihin, false);
                changeNodeHighlight("mihin", node, true);
                chosen_mihin = node;
                updateRoute();
            }
        }

        nodes.forEach(function(node) {
            var nodeName = nodeNames[node];
            var image = $("#image_container");
            var left = img_stop_coordinates[nodeName][0];
            var top = img_stop_coordinates[nodeName][1];
            var button = $("<div></div>").addClass("map_button").css("left", left + "%").css("top", top + "%").attr("id", "button" + node);
            image.append(button);
        });
        $("#image_container").on('click', img_clickHandler);

        $(".map_button").on({
            mouseenter: function(e) {
                var id = $(e.target).attr("id");
                if (id !== undefined && id.slice(0, 6) === "button") {
                    var node = Number(id.slice(6));
                    img_BusstopMouseenter(node);
                }
            },
            mouseleave: function(e) {
                img_BusstopMouseleave();
            }
        });

        function img_clickHandler(e) {
            var id = $(e.target).attr("id");
            if (id !== undefined && id.slice(0, 6) === "button") {
                var node = Number(id.slice(6));
                imgBusstopClicked(node);
            }
        }

        function img_BusstopMouseenter(node) {
            if (($(window).width() <= hoverOnLimit) || isHoveringInfo) return;
            populateHoverInfo(node);
            var info_offset_top = -20;
            var info_offset_left = 4.5;
            var nodeName = nodeNames[node];
            var left = img_stop_coordinates[nodeName][0];
            var top = img_stop_coordinates[nodeName][1];
            hover_route_info.show().css("top", top + info_offset_top + "%").css("left", left + info_offset_left + "%");
        }

        function img_BusstopMouseleave() {
            if (isHoveringInfo) return;
            setTimeout(hideHoverInfo, hoverDelay);
        }

        function hideHoverInfo() {
            if (!isHoveringInfo) hover_route_info.hide();

        }

        function populateHoverInfo(node) {
            hover_route_info.empty();
            var startRow = $("<div><span>" + nodeNames[node] + "&nbsp;&#8594;" + "</span></div>").attr("id", "hove_start_line");
            hover_route_info.append(startRow);
            nodes.forEach(function(n) {
                if (n !== node) {
                    var duration = routeDuration[n][node];
                    if (duration !== Infinity) {
                        var elem = $("<div></div>").addClass("hover_line_container");
                        var addedSpace = duration < 10 ? "&nbsp;" : "";
                        var span = $("<span>" + nodeNames[n] + "&nbsp;" + addedSpace + duration + " min" + "</span>").addClass("hover_line_span").attr("id", n);
                        elem.append(span);
                        hover_route_info.append(elem);
                    }
                }
            });
            $(".hover_line_span").on("click", function(e) {
                changeNodeHighlight("mista", chosen_mista, false);
                changeNodeHighlight("mihin", chosen_mihin, false);
                chosen_mista = node;
                chosen_mihin = Number($(e.target).attr("id"));
                changeNodeHighlight("mista", chosen_mista, true);
                changeNodeHighlight("mihin", chosen_mihin, true);
                hover_route_info.empty();
                hover_route_info.hide();
                isHoveringInfo = false;
                updateRoute();
            });
        }

        function pressed(rowName, node) {
            if (rowName === "mista" && node !== chosen_mista && node !== chosen_mihin) {
                changeNodeHighlight("mista", chosen_mista, false);
                changeNodeHighlight("mista", node, true);
                chosen_mista = node;
                updateRoute();
            }
            if (rowName === "mihin" && node !== chosen_mihin && node !== chosen_mista) {
                changeNodeHighlight("mihin", chosen_mihin, false);
                changeNodeHighlight("mihin", node, true);
                chosen_mihin = node;
                updateRoute();
            }
        }

        function imgBusstopClicked(node) {
            if (node !== chosen_mihin) {
                changeNodeHighlight("mihin", chosen_mihin, false);
                changeNodeHighlight("mista", chosen_mista, false);
                chosen_mista = chosen_mihin;
                chosen_mihin = node;
                changeNodeHighlight("mihin", chosen_mihin, true);
                changeNodeHighlight("mista", chosen_mista, true);
                updateRoute();
            }
        }

        $("#hover_route_info").on({
            mouseenter: function() {
                isHoveringInfo = true;
                $("#hover_route_info").show();
            },
            mouseleave: function() {
                isHoveringInfo = false;
                //$("#hover_route_info").hide();
                setTimeout(hideHoverInfo, hoverDelay);
            }
        });

        function updateRoute() {
            reitti.empty();
            $(".ball").remove();
            var bestRoute = routeGenerator(chosen_mista, chosen_mihin);
            if (bestRoute === null) {
                $('#reitti').text("Valittua reittiä ei voi kulkea bussilla.");
                return;
            }
            var routeNodes = bestRoute.nodes;
            var totalTime = bestRoute.totalTime;
            routeNodes.forEach(function(node, index) {
                var bestRouteElemContainer = $('<div></div>').addClass("bestRouteElemContainer");
                var bestRouteNode = $('<span>' + nodeNames[node] + '</span>').addClass("bestRouteNode");
                bestRouteElemContainer.append(bestRouteNode);
                reitti.append(bestRouteElemContainer);
                if (index < routeNodes.length - 1) {
                    var routeColorContainer = $('<div></div>').addClass("routeColorContainer").append($('<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>'));
                    routeColorContainer.addClass(roadColors[node][routeNodes[index + 1]]);
                    reitti.append(routeColorContainer);
                    addBall(routeNodes[index], routeNodes[index + 1]);
                }
                reitti.append(routeColorContainer);
            });
            var distanceMessageContainer = $('<div></div>').addClass("distanceMessageContainer").text("Kokonaisaika: " + totalTime + "min");
            reitti.append(distanceMessageContainer);
            updateMap(routeNodes);
        }

        function updateMap(routeNodes) {
            var startNodeName = nodeNames[routeNodes[0]];
            var endNodeName = nodeNames[routeNodes[routeNodes.length - 1]];
            $("#route_start").css("left", img_stop_coordinates[startNodeName][0] + "%").css("top", img_stop_coordinates[startNodeName][1] + "%");
            $("#route_end").css("left", img_stop_coordinates[endNodeName][0] + "%").css("top", img_stop_coordinates[endNodeName][1] + "%");
        }

        function addBall(node1, node2) {
            nBalls = traverseTimes[node1][node2];
            var topOffset = 2.25;
            var leftOffset = 1.25;
            for (var i = 1; i <= nBalls; i++) {
                var ball = $("<div></div>").addClass("ball");
                var left1 = img_stop_coordinates[nodeNames[node1]][0];
                var left2 = img_stop_coordinates[nodeNames[node2]][0];
                var top1 = img_stop_coordinates[nodeNames[node1]][1];
                var top2 = img_stop_coordinates[nodeNames[node2]][1];
                var leftChange = left2 - left1;
                var topChange = top2 - top1;
                var left = left1 + i / (nBalls + 1) * leftChange;
                var top = top1 + i / (nBalls + 1) * topChange;
                ball.css("left", left + leftOffset + "%").css("top", top + topOffset + "%");
                $("#image_container").append(ball);
            }

        }
        changeNodeHighlight("mista", chosen_mista, true);
        changeNodeHighlight("mihin", chosen_mihin, true);

    } catch (error) {
        $('#reitti').text("Palvelussa on teknisiä ongelmia. Yritä hetken kuluttua uudelleen.");
        console.log(error);
    }
})