define(['jquery', 'd3', 'noUiSlider'], function ($, d3, noUiSlider) {

    return {
        // get the body of the page
        getBody: function () {
            return $('body');
        },
        // get the id of the top chart
        getTopLineChartContainer: function () {
            return $('#line-chart-container');
        },
        // get the fixed decimal place of the number
        getDecimal: function(num) {
            var dec = 0;
            if(num === 0) return parseFloat(num).toFixed(0);
            if(parseFloat(num) < 1 && num > 0) {
                dec = (num+"").split('.')[1];
                return dec ? "."+dec.substring(0,2) : dec;
            }
            return parseFloat(num).toFixed(0);
        },
        // get the million abbreviation
        getMillion: function(num) {
            if(num >= 10000) {
                num = num/1000000;
                return num+"M";
            }
            return num;
        },
        // get the number format for large or equal to 1000
        getLargeNumFormat: function(num) {

            if(num >= 1000) {
                return new Intl.NumberFormat().format(num);
            }
            return num;
        },

        // check the window size
        checkWindowSize: function() {
            var $window = $(window);
            var windowSize = $window.width();
            if (windowSize < 1360) {
                return true;
            }
            return false;
        },

        // get the parameters list row template
        getTemplate: function(data, paramsName) {
            var template = `
                <li class="${data.hasHoldValue ? 'hasHoldValueLi' : ''}">
                    <div class="param-label">${data.paramName}</div>
                    <div class="param-right">
                    <div class="param-chart-btn">
                        <a href="javascript:;" class="chart-icon 
                        ${data.paramName !== 'Automate' ? ' jq-chart-icon' : ''}"
                            data-paramGroup="${paramsName+data.id}">
                           <span class="icon-shadow jq-icon-shadow"></span>
                            <svg width="18" height="18" opacity="0.5">
                                <g>
                                    <path fill="none" stroke="#848181" stroke-width="2"
                                        stroke-linecap="round" stroke-miterlimit="10" d="M3.5,11
                                        c0,0,2.5-6.667,10-7.5"/>
                                    <polyline fill="none" stroke="#848181" stroke-miterlimit="10"
                                        points="16.5,15.5 1,15.5 1,0 	"/>
                                </g>
                            </svg>
                        </a>
                    </div>
            `
            if(data.isToggle) {
                template = template + `
                    <div class="param-input">
                        <div class="input-value automate-value">${data.currentValue ? "Yes" : "No"}</div>
                    </div>
                    <div class="param-slider automate">
                        <div class="min-value value">No</div>
                        <div class="automate-checkbox">
                            <input type="checkbox" name="automate" id="automate-input${paramsName}">
                            <label for="automate-input${paramsName}"><span></span></label>
                        </div>
                        <div class="min-value value">Yes</div>
                    </div>
                    </div>
                </li>
                `
            } else {
                if(paramsName === "tactical" || paramsName === "tactical2") {
                    template = template + `
                        <div class="lock-icon-container">
                            <svg width="10" height="16" xmlns="http://www.w3.org/2000/svg">
                                <symbol  id="ico-lock-off" viewBox="-4 -7.042 8 14.083">
                                    <path fill="#BFBFBF" d="M1.434-7.042h-2.867C-2.851-7.042-4-5.893-4-4.475v4.433h8v-4.433C4-5.893,2.851-7.042,1.434-7.042z"/>
                                    <path fill="none" stroke="#BFBFBF" stroke-miterlimit="10" d="M-2.5,2.875v1.167c0,1.381,1.119,2.5,2.5,2.5l0,0
                                        c1.381,0,2.5-1.119,2.5-2.5v-7.167"/>
                                </symbol>

                                <g>
                                    <use xlink:href="#ico-lock-off"  width="8" height="14.083" x="-4" y="-7.042" transform="matrix(1 0 0 -0.9897 5 7.9688)" overflow="visible"/>
                                </g>
                            </svg>
                        </div>
                    `;
                }
                template = template + `
                    <div class="param-input ${data.hasHoldValue ? 'hasHoldValue' : '' }">
                        <div class="input-value jq-input-value" id="${paramsName}-value_${data.id}">
                            ${this.getDecimal(this.getLargeNumFormat(data.currentValue))}</div>
                        <input type="number" value="${data.currentValue}" class="cost-input jq-cost-input hidden-input"
                            id="${paramsName}-input_${data.id}">
                    </div>
                    <div class="param-slider" >
                        <div class="min-value value">${this.getDecimal(data.min)}</div>
                        <div id="${paramsName}-slider_${data.id}" class="slider">
                        ${data.hasHoldValue ? `<span class="hold-value"
                            style="left: ${data.hasHoldValue/data.max*100}%"}></span>`: ''}
                        </div>
                        <div class="max-value value">${this.getMillion(this.getDecimal(data.max))}</div>
                    </div>
                    </div>
                </li>
                `
            }
            return template;
        },
        // append the list of rows of parameters in their container
        appendParameters: function(operaUrl, paramContainer, paramType) {
            var operaTemplate = '';
            var that = this;
            var operaDefaultValues = [];

            var sliderObj = []
            var defaultObj = {}
            var sliderId;
            // get the parameters data
            d3.json(operaUrl, function(error, data) {
                if(error) return error;
                data.parameters.forEach(function(operaData, index) {
                    // Render parameters
                    operaTemplate = that.getTemplate(operaData, paramType);
                    if(index > 6 && paramType === "operational") {
                        paramContainer = $("#operational-success-container");
                    }
                    if(index > 6 && paramType === "operational2") {
                        paramContainer = $("#operational-success-container2");
                    }
                    operaDefaultValues.push(operaData.currentValue);


                    paramContainer.append(operaTemplate);

                    setTimeout(function() {
                        // Render parameters slider
                        sliderId = $('#'+paramType+'-slider_' + (index + 1))[0];
                        if(!sliderId) return;
                        noUiSlider.create(sliderId, {
                            start: [operaData.currentValue],
                            connect: [true, false],
                            range: {
                                'min': operaData.min,
                                'max': operaData.max
                            }
                        });
                        sliderObj.push(sliderId.noUiSlider)
                        // Associate the input with the slider value.
                        var inputSlider = $("#"+paramType+"-input_" + (index + 1));
                        var inputValue = $("#"+paramType+"-value_" + (index + 1));
                        inputSlider.change(function() {
                            sliderId.noUiSlider.set($(this).val());
                        });
                        sliderId.noUiSlider.on('update', function( values, handle ) {
                            inputSlider.val(values[handle]);
                            inputValue.html(that.getLargeNumFormat(that.getDecimal(values[handle])));
                        });
                    }, 1);
                });
            });

            defaultObj[paramType] = operaDefaultValues;
            $(document).on('click', '.restore-default-btn', function() {

                for(var i = 0; i < defaultObj[paramType].length; i++) {
                    $(document).find("#"+paramType+"-value_" + (i + 1)).text(operaDefaultValues[i]);
                    if(sliderObj[i]) sliderObj[i].set(operaDefaultValues[i]);
                }
            })
        },
        // get the table rows template
        getTableTemplate: function(tableData, tableName) {
            var template = `
                <tr>
                    <td>
                        ${tableData.color ? `<span style="background-color: ${tableData.color}"></span>`  : ''}
                    </td>
                    <td>${tableData.name}</td>
                    <td>${tableData.day365}</td>
                    <td>${tableData.day1000}</td>
                    ${tableData.delta && `<td class="delta-td">${tableData.delta}
                        ${tableData.hasRadio ?
                            `
                            <div class="delta-radio-container">
                                <input type="radio" ${tableData.id === 1 ? `checked` : ''}
                                    class="radio-input" name="delta${tableName}" id="delta-${tableData.id}">
                                <label for="delta-${tableData.id}"><span></span></label>
                            </div>
                            `
                          : ''}
                    </td>`}
                </tr>
            `
            return template;
        },
        // render the table rows in the table body
        renderTableRow: function(data, tableBody, tableId) {
            var trTemplate = '';
            var that = this;
                data.parameters.forEach(function(tableData, index) {
                    trTemplate = trTemplate + that.getTableTemplate(tableData, data.tableName);
                });
                tableBody.append(trTemplate).each(function() {
                });
        },
        // get the table data from the json and pass it to the render method
        displayTablesData: function(dataUrl, tableBodyId, tableContainer) {
            var that = this;
            d3.json(dataUrl, function(error, data) {
                if(error) return error;
                data.tables.forEach(function(tableData, i) {
                    var tableBody = $("#"+tableBodyId + (i + 1));
                    that.renderTableRow(tableData, tableBody, tableContainer);
                });
            });
        },
        // paginate the table
        paginateTable: function(perPage, tableId) {
            var tableName = '';
            if(tableId && tableId.length > 1) {
                tableName = tableId;
            } else {
                tableName = '.right-table-container';
            }
            $('#'+tableName).each(function() {
                var currentPage = 0;
                var numPerPage = perPage;
                var $table = $(this);

                $table.bind('repaginate', function() {
                    $table.find('.bermuda-table').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
                });
                $table.trigger('repaginate');
                var numRows = $table.find('.bermuda-table').length;
                var numPages = Math.ceil(numRows / numPerPage);
                var $pager = $('<div class="pager"></div>');
                for (var page = 0; page < numPages; page++) {
                    $('<span class="page-number"></span>').text(page + 1).bind('click', {
                        newPage: page
                    }, function(event) {
                        currentPage = event.data['newPage'];
                        $table.trigger('repaginate');
                        $(this).addClass('active').siblings().removeClass('active');
                    }).append('<span></span>').appendTo($pager).addClass('clickable');
                }
                $pager.appendTo($table).find('span.page-number:first').addClass('active');
            });
        },
        // the actions drop down toggler
        actionsDropDown: function() {
            // DropDown toggle
            $('.actions-selector').click(function(){
                $(this).next('.actions-dd-content').toggle();
                $(this).toggleClass("active");
                $(this).closest('.actions-dd-container').find('.bg-overlay').toggle();
            });

            $(document).click(function(e) {
                var target = e.target;
                if (!$(target).is('.actions-selector') && !$(target).parents().is('.actions-selector')) {
                    $('.actions-dd-content').hide();
                    $('.actions-selector').removeClass('active');
                    $('.actions-dd-container .bg-overlay').hide();
                }
            });
        },
        // the graph drop down toggler
        graphDropDown: function(id, ddId) {
            // DropDown toggle
            $(id).click(function(){
                $(ddId).toggle();
                $(this).toggleClass("active");
                $(this).closest('.graphs-tab-nav').find('.bg-overlay').toggle();

            });

            $(document).click(function(e) {
                var target = e.target;
                if (!$(target).is(id) && !$(target).parents().is(id)) {
                    $(ddId).hide();
                    $(id).removeClass('active');
                }
            });
        },
        // change the graph type
        changeGraphType: function() {
            var li = $('.center-btns-container li');
            li.click(function(){
                var tab_id = $(this).attr('data-graphTypeId');
                li.removeClass('active');
                $('.graph-content').removeClass('active');
                $(this).addClass('active');
                $("#"+tab_id).addClass('active');
                $("#"+tab_id+"2").addClass('active');
            });
        },

        // toggle sensitivity chart
        sensitivityToggler: function() {
            localStorage.clear();
            $(document).on('click', '.jq-chart-icon', function(e) {
                var id = $(this).attr("data-paramGroup");

                $(this).toggleClass('active');
                $(this).closest('.jq-inner-parameters')
                    .removeClass('sensitivity-hidden')
                    .addClass('sensitivity-shown');

                var li = $(this).closest('li')
                li.toggleClass('active')
                    .find('.jq-input-value')
                    .toggle()
                li.find('.jq-cost-input')
                    .toggleClass('hidden-input');

                var active = 0;
                if(localStorage.getItem(id) === id) {
                    active = 0;
                    localStorage.setItem(id, '');
                } else {
                    localStorage.setItem(id, id);
                    active = 1;
                }

                d3.select('#line-id_' + id)
                    .attr('opacity', active);
                var area = d3.select('#area-id_' + id)
                    .attr('opacity', active);
                var rect = d3.select('#drag-id_' + id)
                    .attr('opacity', active);

                var color = '';
                color = d3.select('#drag-id_' + id).attr('fill');

                if(active === 1) {
                    li.find('.noUi-handle').css({ 'background-color': color });
                    li.find('.noUi-connect').css({ 'background-color': color });

                    $(this).closest('li').append(`<span class="before" style="background-color: ${color}"></span>`);
                } else {
                    li.find('.noUi-handle').css({ 'background-color': '' });
                    li.find('.noUi-connect').css({ 'background-color': '' });
                    $(this).closest('li').find('.before').remove();
                }
                console.log();

            })
            $(document).on('click', '.close-sensitivity-btn', function(e) {
                $('.jq-chart-icon').removeClass('active');
                $('.jq-inner-parameters')
                    .addClass('sensitivity-hidden')
                    .removeClass('sensitivity-shown');
                var li = $('.jq-inner-parameters').find('li')

                li.removeClass('active')
                    .find('.jq-input-value')
                    .show()
                li.find('.jq-cost-input')
                    .addClass('hidden-input');

                // hide the line path
                localStorage.clear();

                d3.selectAll('.group-line path')
                    .attr('opacity', 0);
                d3.selectAll('.group-area path')
                    .attr('opacity', 0);
                d3.selectAll('.btn-per-line rect')
                    .attr('opacity', 0);

                li.find('.noUi-handle').css({ 'background-color': '' });
                li.find('.noUi-connect').css({ 'background-color': '' });
                li.find('.before').remove();
            });
        },

        // Display the save modal
        displaySaveModal: function() {
            $(document).on('click', '.jq-save-btn', function(e) {
                $('.jq-save-modal-container').show();
                $('.bg-overlay').show();
            })
            $(document).on('click', '.jq-close-btn, .jq-modal-save-btn, .bg-overlay', function(e) {
                $('.jq-save-modal-container').hide();
                $('.bg-overlay').hide();
            })
        },

        // Display the save modal
        displayExportModal: function() {
            $(document).on('click', '.jq-export-btn', function(e) {
                $('.jq-export-modal-container').show();
                $('.bg-overlay').show();
            })
            $(document).on('click', '.jq-close-btn, .jq-modal-download-btn, .jq-modal-send-btn, .bg-overlay', function(e) {
                $('.jq-export-modal-container').hide();
                $('.bg-overlay').hide();
            })
        },

        // Display the save modal
        displayLoadModal: function() {
            $(document).on('click', '.jq-load-btn', function(e) {
                $('.jq-load-modal-container').show();
                $('.bg-overlay').show();
            })
            $(document).on('click', '.jq-close-btn, .jq-modal-load-btn, .bg-overlay', function(e) {
                $('.jq-load-modal-container').hide();
                $('.bg-overlay').hide();
            })
        },

        // Display the save modal
        displayAddModal: function() {
            $(document).on('click', '.jq-add-btn', function(e) {
                $('.jq-add-modal-container').show();
                $('.bg-overlay').show();
            })
            $(document).on('click', '.jq-close-btn, .jq-modal-add-btn, .bg-overlay', function(e) {
                $('.jq-add-modal-container').hide();
                $('.bg-overlay').hide();
            })
        },

        // get the template of the load
        getLoadTemplate: function(data) {
            var template = `
                <div class="new-notification">
                    <div class="date">${data.date}</div>
                    <div class="time">${data.time}</div>
                    <div class="scenario">${data.scenario}</div>
                    <div class="delete-row">
                        <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg" opacity="0.25">
                            <g>
                                <rect x="12.375" y="5.25" fill="#5D98D1" width="5" height="1"/>
                                <polygon fill="#5D98D1" points="18.605,22.25 11.145,22.25 8.906,10.25 20.844,10.25 				"/>
                                <rect x="8.375" y="6.25" fill="#5D98D1" width="13" height="2"/>
                            </g>
                        </svg>
                    </div>
                </div>
            `
            return template;
        },

        // render the loaded rows
        renderLoadRows: function(dataUrl, container) {
            var template = '';
            var that = this;
            d3.json(dataUrl, function(error, data) {
                if(error) return error;
                data.loads.forEach(function(loadData, i) {
                    template += that.getLoadTemplate(loadData)
                });
                $('.'+container).append(template);
            });
            $(document).on('click', '.delete-row', function() {
                $(this).closest('.new-notification').remove();
            })
        },

        // the graph drop down toggler for tablet
        graphDropDownTablet: function() {
            var that = this;
            $(window).resize(function() {
                that.checkWindowSize()
            })
            if(that.checkWindowSize()) {
                // DropDown toggle
                $(document).find('.selected-graph').click(function(){
                    
                    $(this).next('.graph-menu-container').toggleClass('show-g-menu');
                    $(this).toggleClass("active");
                });

                $(document).click(function(e) {
                    var target = e.target;
                    if (!$(target).is('.selected-graph') && !$(target).parents().is('.selected-graph')) {
                        $('.graph-menu-container').removeClass('hidden-g-menu');
                        $('.selected-graph').removeClass('active');
                    }
                });
            }

            $(document).on('click', '.remove-graph-icon', function(){
                $(this).closest('li').remove();
            });
            $('.load-from').click(function() {
                var ul = $('.graph-menu-container ul');
                var liLength = ul.find('li').length;
                var temp = `
                    <li class="active">
                        <a href="javascript:;" class="text">Graph ${liLength+1}</a>
                        <a href="javascript:;" class="remove-graph-icon">
                            <svg width="7" height="7" xmlns="http://www.w3.org/2000/svg" opacity="0.5">
                                <g><path d="M2.116,3.331L0,1.214l1.197-1.198l2.116,2.116L5.446,0l1.198,1.198L4.512,3.331l2.116,2.116L5.43,6.645
                                            L3.313,4.528L1.208,6.633L0.011,5.436L2.116,3.331z"/>
                                </g>
                            </svg>
                        </a>
                    </li>
                `
                ul.append(temp);

                $('.jq-add-modal-container').hide();
                $('.bg-overlay').hide();
            })
        },

        // toggle between table and gauge chart.
        toggleTableGauge: function() {
            var gSelector = $('.gauge-chart-selector');
            var pNum = $('.page-number');
            var tContainer = $('.bermuda-table-container');
            gSelector.on('click', function() {
                $(this).addClass('active');
                var gaugeContainer = $(document).find('.right-table-container .center-gauge-chart-container');
                tContainer.hide();
                gaugeContainer.remove();
                pNum.removeClass('active');
                $('.center-gauge-chart-container').clone()
                    .removeClass('hidden-tablet')
                    .prependTo('.right-table-container');
            });

            pNum.on('click', function() {
                $(this).addClass('active');
                gSelector.removeClass('active');
                var gaugeContainer = $(document).find('.right-table-container .center-gauge-chart-container');
                tContainer.show();
                gaugeContainer.remove();
            })
        },

        //  show hold values
        showHoldValues: function() {
            $('.hold-values-btn').on('click', function() {
                var doc = $(document);
                doc.find('.hasHoldValueLi').addClass('active');
                doc.find('.hold-value').show();
                doc.find('.hasHoldValue').find('.input-value.jq-input-value').hide();
                doc.find('.hasHoldValue').find('.cost-input.jq-cost-input').removeClass('hidden-input');
                doc.find('.delta-td').show();
                doc.find('.gauge-chart').addClass('has-hold-value');
                doc.find('th:last-child').show();
                d3.select('#yellow-indicator').attr('opacity', 1);
                d3.select('.circle_line-indicator:last-child').attr('opacity', 1);
            })
        }
    }
});
