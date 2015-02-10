updateDots = initDotDensity();
       $.when($.ajax({url: "/api/msa", data: {metro:41860}, traditional: true})).done(function(data){
         sfMSA = data;
         updateDots(sfMSA);
       });

