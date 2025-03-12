$(document).ready(function () {
    // Add Event Analysis Tab to the Sidebar
    var sidebarMenu = $('#left-menu');
    sidebarMenu.append(`
        <li id="nav-event-analysis">
            <a href="#" onclick="loadEventAnalysisTab()">
                <i class="fa fa-chart-bar"></i> <span>Event Analysis</span>
            </a>
        </li>
    `);

    // Function to Load the Event Analysis Tab
    window.loadEventAnalysisTab = function () {
        $.get('/event-analysis', function (html) {
            $('#tab-content').html(html);
        });
    };
});