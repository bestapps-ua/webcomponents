let scheme = {
  "document": {
    "type": "APL",
    "version": "1.4",
    "settings": {},
    "theme": "dark",
    "import": [],
    "resources": [],
    "styles": {},
    "onMount": [],
    "graphics": {},
    "commands": {},
    "layouts": {},
    "mainTemplate": {
      "parameters": [
        "payload"
      ],
      "items": [
        {
          "type": "Container",
          "width": "100%",
          "height": "100%",
          "paddingTop": "0",
          "paddingLeft": "0",
          "paddingRight": "0",
          "paddingBottom": "0",
          "items": [
            {
              "type": "Frame",
              "width": "50%",
              "height": "100%",
              "backgroundColor": "#fff",
              "borderColor": "#fffffff",
              "item": [
                {
                  "type": "Image",
                  "width": "100%",
                  "height": "100%",
                  "source": "https://alexa.pierreoffers.com/drisco/drisco_main.png",
                  "scale": "fill"
                }
              ]
            },
            {
              "type": "Frame",
              "width": "50%",
              "height": "100%",
              "item": [
                {
                  "type": "Frame",
                  "width": "100%",
                  "height": "100%",
                  "backgroundColor": "#fff",
                  "item": [
                    {
                      "type": "Container",
                      "width": "100%",
                      "height": "100%",
                      "shadowRadius": "0",
                      "shadowColor": "#fff",
                      "shadowHorizontalOffset": "0",
                      "shadowVerticalOffset": "0",
                      "wrap": "noWrap",
                      "alignItems": "center",
                      "items": [
                        {
                          "type": "Frame",
                          "width": "100%",
                          "height": "41.5%",
                          "item": [
                            {
                              "type": "Container",
                              "width": "100%",
                              "height": "100%",
                              "items": [
                                {
                                  "type": "Frame",
                                  "width": "100%",
                                  "height": "50%",
                                  "alignSelf": "auto",
                                  "item": [
                                    {
                                      "type": "Container",
                                      "width": "100%",
                                      "height": "100%",
                                      "paddingTop": "0",
                                      "paddingLeft": "0",
                                      "paddingRight": "0",
                                      "paddingBottom": "0",
                                      "alignItems": "center",
                                      "direction": "column",
                                      "justifyContent": "center",
                                      "items": [
                                        {
                                          "type": "Image",
                                          "width": "280px",
                                          "height": "75px",
                                          "source": "https://alexa.pierreoffers.com/drisco/Drisco_Hotel_logo_G.png",
                                          "scale": "best-fill"
                                        }
                                      ],
                                      "wrap": "noWrap"
                                    }
                                  ]
                                },
                                {
                                  "type": "Frame",
                                  "width": "100%",
                                  "height": "50%",
                                  "item": [
                                    {
                                      "type": "Container",
                                      "width": "100%",
                                      "height": "100%",
                                      "items": [
                                        {
                                          "type": "Text",
                                          "width": "auto",
                                          "height": "auto",
                                          "text": "Welcome to Hotel Drisco",
                                          "fontSize": "30dp",
                                          "color": "#3F4B00",
                                          "fontWeight": "bold"
                                        }
                                      ],
                                      "alignItems": "center",
                                      "direction": "column",
                                      "justifyContent": "center"
                                    }
                                  ]
                                }
                              ],
                              "alignItems": "center"
                            }
                          ]
                        },
                        {
                          "type": "Frame",
                          "width": "100%",
                          "height": "58.5%",
                          "item": [
                            {
                              "type": "Container",
                              "width": "100%",
                              "height": "100%",
                              "shadowColor": "#fff",
                              "items": [
                                {
                                  "type": "TouchWrapper",
                                  "width": "36.25%",
                                  "height": "32.05%",
                                  "position": "absolute",
                                  "item": [
                                    {
                                      "type": "Frame",
                                      "width": "100%",
                                      "height": "100%",
                                      "borderWidth": "1",
                                      "borderColor": "#707070",
                                      "id": "checkInFrame",
                                      "item": [
                                        {
                                          "type": "Container",
                                          "width": "100%",
                                          "height": "100%",
                                          "alignItems": "center",
                                          "direction": "column",
                                          "justifyContent": "center",
                                          "items": [
                                            {
                                              "type": "Text",
                                              "id": "checkInText",
                                              "width": "auto",
                                              "height": "auto",
                                              "text": "Check In",
                                              "fontSize": "26dp",
                                              "color": "#565656",
                                              "fontWeight": "bold"
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ],
                                  "left": "9.84%",
                                  "onPress": [
                                    {
                                      "type": "SetValue",
                                      "componentId": "checkInFrame",
                                      "property": "backgroundColor",
                                      "value": "#787E64"
                                    },
                                    {
                                      "type": "SetValue",
                                      "componentId": "checkInText",
                                      "property": "color",
                                      "value": "#FFFFFF"
                                    },
                                    {
                                      "type": "SendEvent",
                                      "arguments": [
                                        "checkIn"
                                      ]
                                    }
                                  ]
                                },
                                {
                                  "type": "TouchWrapper",
                                  "width": "36.25%",
                                  "height": "32.05%",
                                  "position": "absolute",
                                  "item": [
                                    {
                                      "type": "Frame",
                                      "width": "100%",
                                      "height": "100%",
                                      "borderWidth": "1",
                                      "borderColor": "#707070",
                                      "id": "checkOutFrame",
                                      "item": [
                                        {
                                          "type": "Container",
                                          "width": "100%",
                                          "height": "100%",
                                          "paddingTop": "0",
                                          "paddingLeft": "0",
                                          "paddingRight": "0",
                                          "paddingBottom": "0",
                                          "alignItems": "center",
                                          "direction": "column",
                                          "justifyContent": "center",
                                          "items": [
                                            {
                                              "type": "Text",
                                              "id": "checkOutText",
                                              "width": "auto",
                                              "height": "auto",
                                              "text": "Check Out",
                                              "fontSize": "26dp",
                                              "color": "#565656",
                                              "fontWeight": "bold"
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ],
                                  "right": "9.84%",
                                  "onPress": [
                                    {
                                      "type": "SetValue",
                                      "componentId": "checkOutFrame",
                                      "property": "backgroundColor",
                                      "value": "#787E64"
                                    },
                                    {
                                      "type": "SetValue",
                                      "componentId": "checkOutText",
                                      "property": "color",
                                      "value": "#FFFFFF"
                                    },
                                    {
                                      "type": "SendEvent",
                                      "arguments": [
                                        "checkOut"
                                      ]
                                    }
                                  ]
                                },
                                {
                                  "type": "TouchWrapper",
                                  "width": "36.25%",
                                  "height": "32.05%",
                                  "alignSelf": "auto",
                                  "position": "absolute",
                                  "left": "9.84%",
                                  "top": "41.89%",
                                  "onPress": [
                                    {
                                      "type": "SetValue",
                                      "componentId": "hotelDeskFrame",
                                      "property": "backgroundColor",
                                      "value": "#787E64"
                                    },
                                    {
                                      "type": "SetValue",
                                      "componentId": "hotelDeskText",
                                      "property": "color",
                                      "value": "#FFFFFF"
                                    },
                                    {
                                      "type": "SendEvent",
                                      "arguments": [
                                        "hotelDesk"
                                      ]
                                    }
                                  ],
                                  "item": [
                                    {
                                      "type": "Frame",
                                      "width": "100%",
                                      "height": "100%",
                                      "borderWidth": "1",
                                      "borderColor": "#707070",
                                      "id": "hotelDeskFrame",
                                      "item": [
                                        {
                                          "type": "Container",
                                          "width": "100%",
                                          "height": "100%",
                                          "paddingTop": "0",
                                          "paddingLeft": "0",
                                          "paddingRight": "0",
                                          "paddingBottom": "0",
                                          "alignItems": "center",
                                          "direction": "column",
                                          "justifyContent": "center",
                                          "items": [
                                            {
                                              "type": "Text",
                                              "id": "hotelDeskText",
                                              "width": "auto",
                                              "height": "auto",
                                              "text": "Hotel Desk",
                                              "fontSize": "26dp",
                                              "color": "#565656",
                                              "fontWeight": "bold"
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ]
                                },
                                {
                                  "type": "TouchWrapper",
                                  "width": "36.25%",
                                  "height": "32.05%",
                                  "position": "absolute",
                                  "onPress": [
                                    {
                                      "type": "SetValue",
                                      "componentId": "conciergeFrame",
                                      "property": "backgroundColor",
                                      "value": "#787E64"
                                    },
                                    {
                                      "type": "SetValue",
                                      "componentId": "conciergeText",
                                      "property": "color",
                                      "value": "#FFFFFF"
                                    },
                                    {
                                      "type": "SendEvent",
                                      "arguments": [
                                        "concierge"
                                      ]
                                    }
                                  ],
                                  "item": [
                                    {
                                      "type": "Frame",
                                      "width": "100%",
                                      "height": "100%",
                                      "borderWidth": "1",
                                      "borderColor": "#707070",
                                      "id": "conciergeFrame",
                                      "item": [
                                        {
                                          "type": "Container",
                                          "width": "100%",
                                          "height": "100%",
                                          "paddingTop": "0",
                                          "paddingLeft": "0",
                                          "paddingRight": "0",
                                          "paddingBottom": "0",
                                          "alignItems": "center",
                                          "direction": "column",
                                          "justifyContent": "center",
                                          "items": [
                                            {
                                              "type": "Text",
                                              "id": "conciergeText",
                                              "width": "auto",
                                              "height": "auto",
                                              "text": "Concierge",
                                              "fontSize": "26dp",
                                              "color": "#565656",
                                              "fontWeight": "bold"
                                            }
                                          ]
                                        }
                                      ]
                                    }
                                  ],
                                  "right": "9.84%",
                                  "top": "41.89%"
                                }
                              ],
                              "direction": "row",
                              "justifyContent": "spaceBetween",
                              "alignItems": "start",
                              "wrap": "wrap"
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  "borderColor": "#fff",
                  "borderRadius": "0",
                  "borderStrokeWidth": "0",
                  "borderWidth": "0"
                }
              ],
              "backgroundColor": "#fff",
              "borderColor": "#fff",
              "borderRadius": "0",
              "borderStrokeWidth": "0",
              "borderWidth": "0",
              "left": "0",
              "top": "0",
              "right": "0",
              "bottom": "0"
            }
          ],
          "alignItems": "start",
          "direction": "row"
        }
      ]
    }
  },
  "datasources": {},
  "sources": {}
}