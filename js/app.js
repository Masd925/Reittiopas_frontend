$(function () {
    try {
        var routes = JSON.parse(reittiopasJsonTxt);
        var nodeNames = routes.pysakit; // ["A", "B", ..., "R"]
        var nodes = nodeNames.map(function (elem, index) { return index; }); // [0,1,...,17]
        var nNodes = nodes.length;
        var roads = routes.tiet;
        var busLines = routes.linjastot;

        function nodeIndex(nodeName) {
            return nodeNames.indexOf(nodeName);
        }

        var roadTraverseTimes = nodes.reduce(function (acc, curr) {
            acc[curr] = {};
            return acc;
        }, {});
        roads.forEach(function (road) {
            var from = road.mista;
            var to = road.mihin;
            var duration = road.kesto;
            roadTraverseTimes[nodeIndex(from)][nodeIndex(to)] = duration;
            roadTraverseTimes[nodeIndex(to)][nodeIndex(from)] = duration;
        });
        var traverseTimes = nodes.reduce(function (acc, curr) {
            acc[curr] = {};
            return acc;
        }, {});
        var roadColors = nodes.reduce(function (acc, curr) {
            acc[curr] = {};
            return acc;
        }, {});

        Object.keys(busLines).forEach(function (color) {
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

        function fastestRoutes(traverseTimes) {
            var nodes = Object.keys(traverseTimes).map(Number);
            var nNodes = nodes.length;
            var routeDuration = nodes.map(function (elem) {
                return nodes.slice().map(function () { return Infinity; });
            });
            var nextNode = nodes.map(function (elem) {
                return nodes.slice().map(function () { return null; });
            });
            nodes.forEach(function (node) {
                Object.keys(traverseTimes[node]).forEach(function (neighbour) {
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
            function bestPath(source, destination) {
                var nodes = [source];
                var node = source;
                while (node !== destination) {
                    node = nextNode[node][destination];
                    if (node === null) return null;
                    nodes.push(node);
                }
                return { nodes: nodes, totalTime: routeDuration[source][destination] };
            }
            return bestPath;
        }

        var routeGenerator = fastestRoutes(traverseTimes);

        var mista = $('#mista');
        var mihin = $('#mihin');
        var reitti = $('#reitti');

        nodes.forEach(function (node) {
            var nodeButtonContainer = $('<div></div>').addClass("nodeButtonContainer");
            nodeButtonContainer.attr("id", "mista" + node).addClass("mista-buttons", "buttons");
            var nodeElem = $('<span>' + nodeNames[node] + '</span>').addClass("nodeElem");
            nodeButtonContainer.append(nodeElem);
            mista.append(nodeButtonContainer);

            nodeButtonContainer = $('<div></div>').addClass("nodeButtonContainer");
            nodeButtonContainer.attr("id", "mihin" + node).addClass("mihin-buttons", "buttons");
            nodeElem = $('<span>' + nodeNames[node] + '</span>').addClass("nodeElem");
            nodeButtonContainer.append(nodeElem);
            mihin.append(nodeButtonContainer);
        });

        var chosen_mista = 0;
        var chosen_mihin = 1;

        function changeNodeHighlight(rowName, node, isAdded) {
            if (isAdded) $('#' + rowName + node).addClass("highlight");
            else $('#' + rowName + node).removeClass("highlight");
        }

        changeNodeHighlight("mista", chosen_mista, true);
        changeNodeHighlight("mihin", chosen_mihin, true);
        updateRoute();

        $("#content-panel").on('click', clickHandler);

        function clickHandler(e) {
            var id = $(e.target).attr("id");
            if (id === undefined) id = $(e.target).parent().attr("id");
            if (id !== undefined) {
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

        

        function updateRoute() {
            reitti.empty();
            var bestRoute = routeGenerator(chosen_mista, chosen_mihin);
            var nodes = bestRoute.nodes;
            var totalTime = bestRoute.totalTime;
            nodes.forEach(function(node){
                
            });

            console.log(bestRoute);
            console.log(bestRoute.nodes.map(function (elem) { return nodeNames[elem]; }));
        }

        //console.log((fastestRoutes(traverseTimes)(16,9)));
        console.log(fastestRoutes(traverseTimes)(0, 17).nodes.map(function (elem) { return nodeNames[elem]; }));

    }
    catch (error) {
        $('#reitti').text("Palvelussa on teknisiä ongelmia. Yritä hetken kuluttua uudelleen.")
    }
})