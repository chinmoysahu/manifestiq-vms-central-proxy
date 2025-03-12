$(document).ready(function () {
    var theWindow = $('#tab-event-analysis')
    addOnTabOpen('eventAnalysis', function () {

    })
    addOnTabReopen('eventAnalysis', function () {

    })
    addToEventHandler('onDashboardReady', function(){

    })
    // Function to Load Event Analysis Data
    function loadEventAnalysisData() {
        $.get('/api/event-analysis', function (data) {
            let tableBody = $('#event-analysis-table tbody');
            tableBody.empty();
            
            data.forEach(region => {
                tableBody.append(`
                    <tr>
                        <td>${region.name}</td>
                        <td>${region.openAlerts.toLocaleString()}</td>
                        <td>${region.totalAlerts.toLocaleString()}</td>
                    </tr>
                `);
            });
        }).fail(function () {
            console.error('Failed to load event analysis data');
        });
    }

    // Load Data on Tab Click
    $(document).on('click', '#nav-event-analysis', function () {
        loadEventAnalysisData();
    });

    // Initial Load
    if ($('#event-analysis-table').length) {
        loadEventAnalysisData();
    }
});