$(function(){
    var routes = JSON.parse(reittiopasJsonTxt);
    var nodeNames = routes.pysakit; // ["A", "B", ..., "R"]
    var nodes = nodeNames.map(function(elem,index){return index;}); // [0,1,...,17]
    var nNodes = nodes.length;
    var roads = routes.tiet;
    var busLines = routes.linjastot;
    
    function nodeIndex (nodeName) {
        return nodeNames.indexOf(nodeName);
    }

    var roadTraverseTimes = nodes.reduce(function(acc,curr){
        acc[curr] = {};
        return acc;
    },{});
    roads.forEach(function(road){
        var from = road.mista;
        var to = road.mihin;
        var duration = road.kesto;
        roadTraverseTimes[nodeIndex(from)][nodeIndex(to)] = duration;
        roadTraverseTimes[nodeIndex(to)][nodeIndex(from)] = duration;
    });
    var traverseTimes = nodes.reduce(function(acc,curr){
        acc[curr] = {};
        return acc;
    },{});
    var roadColors = nodes.reduce(function(acc,curr){
        acc[curr] = {};
        return acc;
    },{});

    Object.keys(busLines).forEach(function(color){
        var nodes = busLines[color].map(nodeIndex);
        for (var i=0; i<nodes.length-1; i++) {
            var first = nodes[i];
            var second = nodes[i+1];
            traverseTimes[first][second] = roadTraverseTimes[first][second];
            traverseTimes[second][first] = roadTraverseTimes[second][first];
            roadColors[first][second] = color;
            roadColors[second][first] = color;
        }
    });

    function fastestRoutes (traverseTimes) {
        var nodes = Object.keys(traverseTimes).map(Number);
        var nNodes = nodes.length;
        var routeDuration = nodes.map(function(elem){
            return nodes.slice().map(function(){return Infinity;});
        });
        var nextNode = nodes.map(function(elem){
            return nodes.slice().map(function(){return null;});
        });
        nodes.forEach(function(node){
            Object.keys(traverseTimes[node]).forEach(function(neighbour){
                routeDuration[node][neighbour] = traverseTimes[node][neighbour];
                nextNode[node][neighbour] = Number(neighbour);
            });
            routeDuration[node][node] = 0;
            nextNode[node][node] = node;
        });
        for (k=0; k<nNodes; k++) {
          for (i=0; i<nNodes; i++) {
            for (j=0; j<nNodes; j++) {
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
          while (node!==destination) {
            node = nextNode[node][destination];
            if (node===null) return null;
            nodes.push(node);
          }
          return {nodes:nodes, totalTime:routeDuration[source][destination]};
        }
        return bestPath;
    }

    console.log(fastestRoutes(traverseTimes)(17,0));

})