import React from 'react';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,
  Marker,
} from "react-simple-maps"
import bahia from './data/29.json'
import ongsbrasil from './data/ongsbrasil.json'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import { Motion, spring } from "react-motion"
import { scaleLinear } from "d3-scale"
import Slider from '@material-ui/core/Slider';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
// https://maps.google.com/maps/api/geocode/json?address=bahia,brazil&sensor=false&key=AIzaSyB6tdrEwK6j9D8sWpTp2ZhBAPYn0Ki-9VE
// function googleProjection(prj) {
//   return function(lnglat) {
//     ret = prj.fromLatLngToDivPixel(new google.maps.LatLng(lnglat[1],lnglat[0]))
//     return [ret.x, ret.y]
//   };
// }
const DEFAULT_ZOOM = 24;
const DEFAULT_CENTER = [-40.86389119251985, -13.454818348385821];
class App extends React.Component {
  constructor() {
    super()
    this.state = {
      showOngsNumber: false,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      cityScale: scaleLinear().domain([1, 40]).range([1, 50]),
      x: 0,
      y: 0,
      markers: [],
      cidades: [],
      info: {
        "id": undefined,
        "nome": undefined,
        "microrregiao": {
          "id": undefined,
          "nome": undefined,
          "mesorregiao": {
            "id": undefined,
            "nome": undefined,
            "UF": {
              "id": undefined,
              "sigla": undefined,
              "nome": undefined,
              "regiao": {
                "id": undefined,
                "sigla": undefined,
                "nome": undefined
              }
            }
          }
        }
      }
    }

    this.handleZoomIn = this.handleZoomIn.bind(this)
    this.handleZoomOut = this.handleZoomOut.bind(this)
  }
  componentDidMount = () => {
    let markers = this.state.markers;
    var groupBy = function (xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

    markers = ongsbrasil
      .filter(o => o.estado === 'BA')
      .map(o => {
        const feature = bahia.features.filter(b => b.properties.name === o.cidade)[0]
        if (!feature) return null;
        return (
          {
            ...o,
            coordinates: feature.geometry.coordinates[0][0],
          }
        )
      })
      .filter(o => o !== null);
    let group = groupBy(markers, 'coordinates');
    const cidades = Object.keys(group).map(key => ({ name: group[key][0].cidade, coordinates: group[key][0].coordinates, ongs: group[key].length }))
    this.setState({ markers, cidades })
  }

  onMouseMove = async (e) => {
    await this.setState({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  getCoord = async (enderenco) => {
    const response = await fetch(`https://maps.google.com/maps/api/geocode/json?address=${enderenco}&sensor=false&key${process.env.REACT_APP_CHAVES_MAPS_API}`)
  }

  handleMoveStart(currentCenter) {
    // console.log("New center: ", currentCenter)
  }

  handleMoveEnd(newCenter) {
    // console.log("New center: ", newCenter)
  }

  handleZoomIn() {
    if (this.state.zoom > 150) return;
    this.setState({
      zoom: (this.state.zoom + 5)
    })
  }
  handleZoomOut() {
    if (this.state.zoom < DEFAULT_ZOOM){
      return this.setState({
        center: DEFAULT_CENTER
      });
    }
    this.setState({
      zoom: (this.state.zoom - 10),
    })
  }
  handleInfo = async (geography) => {
    await this.setState({
      info: geography.properties,
    })
  }
  handleZoom = async (geography) => {
    await this.setState({
      center: geography.geometry.coordinates[0][0], zoom: 70,
    })
  }

  googleProjection = (prj, maps) => {
    return function (lnglat) {
      const ret = prj.fromLatLngToDivPixel(maps.LatLng(lnglat[1], lnglat[0]))
      return [ret.x, ret.y]
    };
  }

  handleApiLoaded = (map, maps) => {

    if (maps && maps.OverlayView) {
      // const overlay = maps.OverlayView();
      // // overlay.onAdd = function () { }
      // // overlay.draw = function () { }
      // overlay.setMap(map);
      // const projection = this.googleProjection(overlay.getProjection());

    }
  };



  render() {
    const { info, loading } = this.state;
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            {/* <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton> */}
            <Typography variant="h6" >
              Mapa
          </Typography>
          </Toolbar>
        </AppBar>
        <Grid container spacing={3} justify='flex-start' alignItems='center' alignContent='center' style={{ margin: 8 }}>
          <Grid item style={{ position: 'relative' }}>
            <Card elevation={0}>
              <CardContent onWheel={(e) => e.deltaY < 0 ? this.handleZoomIn() : this.handleZoomOut()}>
                <div style={{ height: 800, width: 1024 }}>
                  {/* <GoogleMapReact
                            bootstrapURLKeys={{ key: 'AIzaSyB6tdrEwK6j9D8sWpTp2ZhBAPYn0Ki-9VE'}}
                            defaultCenter={{
                                lat: -13.3945273,
                                lng: -46.4799032
                            }}
                          defaultZoom={6}
                          yesIWantToUseGoogleMapApiInternals
                          onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
                          > */}
                  <Motion
                    defaultStyle={{
                      zoom: 1,
                      x: 0,
                      y: 20,
                    }}
                    style={{
                      zoom: spring(this.state.zoom, { stiffness: 210, damping: 20 }),
                      x: spring(this.state.center[0], { stiffness: 210, damping: 20 }),
                      y: spring(this.state.center[1], { stiffness: 210, damping: 20 }),
                    }}
                  >
                    {({ zoom, x, y }) => (
                      <div onMouseMove={this.onMouseMove} onMouseLeave={() => this.setState({info: null})}>
                        <ComposableMap projection='mercator' width={1024} height={800} style={{ cursor: 'pointer' }} >
                          <ZoomableGroup
                            center={[x, y]}
                            onMoveStart={this.handleMoveStart}
                            onMoveEnd={this.handleMoveEnd}
                            zoom={zoom}>
                            <Geographies geography={bahia.features}>
                              {(geographies, projection) => geographies.map((geography, i) => {
                                return <Geography
                                  style={{
                                    default: {
                                      fill: "#ECEFF1",
                                      stroke: "#607D8B",
                                      strokeWidth: 0.025,
                                      outline: "none",
                                    },
                                    hover: {
                                      fill: "#607D8B",
                                      stroke: "#607D8B",
                                      strokeWidth: 0.025,
                                      outline: "none",
                                    },
                                    pressed: {
                                      fill: "#FF5722",
                                      stroke: "#607D8B",
                                      strokeWidth: 0.025,
                                      outline: "none",
                                    },
                                  }}
                                  onMouseEnter={() => this.handleInfo(geography)}
                                  onClick={() => this.handleZoom(geography)}
                                  key={i}
                                  geography={geography}
                                  projection={projection}
                                />
                              })}
                            </Geographies>
                            {this.state.showOngsNumber &&
                              <Markers>
                                {this.state.cidades.map((city, i) => (
                                  <Marker
                                    key={i}
                                    marker={city}
                                  >
                                    <g>
                                      <text
                                        textAnchor="middle"
                                        x={10}
                                        y={5}
                                        style={{
                                          fontFamily: "Roboto, sans-serif",
                                          fill: "none",
                                          stroke: "#DDDDDD",
                                        }}
                                      >
                                        {`${city.ongs}`}
                                      </text>
                                      <circle
                                        cx={0}
                                        cy={0}
                                        r={this.state.cityScale(city.ongs)}
                                        fill="rgba(255,87,34,0.8)"
                                        stroke="#607D8B"
                                        strokeWidth="2"
                                      />
                                    </g>
                                  </Marker>
                                ))}
                              </Markers>}
                            {this.state.showCity &&
                              <Markers>
                                {this.state.markers.map((marker, i) => (
                                  <Marker
                                    onClick={() => {
                                      const markers = this.state.markers;
                                      this.setState({ markers: markers.map((m, key) => ({ ...m, show: key === i })) })
                                    }
                                    }
                                    key={i}
                                    marker={marker}
                                    style={{
                                      default: { stroke: "#FF5722" },
                                      hover: { stroke: "#FF5722" },
                                      pressed: { stroke: "#FF5722" },
                                    }}
                                  >
                                    <g transform="translate(-12, -24)">
                                      <path
                                        fill="none"
                                        strokeWidth="2"
                                        strokeLinecap="square"
                                        strokeMiterlimit="10"
                                        strokeLinejoin="miter"
                                        d="M20,9c0,4.9-8,13-8,13S4,13.9,4,9c0-5.1,4.1-8,8-8S20,3.9,20,9z"
                                      />
                                      <circle
                                        fill="none"
                                        strokeWidth="2"
                                        strokeLinecap="square"
                                        strokeMiterlimit="10"
                                        strokeLinejoin="miter"
                                        cx="12"
                                        cy="9"
                                        r="3"
                                      />
                                    </g>
                                    {marker.show && <text
                                      textAnchor="middle"
                                      y={40}
                                      style={{
                                        fontFamily: "Roboto, sans-serif",
                                        fill: "none",
                                        stroke: "#FF5722",
                                      }}
                                    >
                                      {marker.name}
                                    </text>}
                                  </Marker>

                                ))}
                              </Markers>
                            }
                          </ZoomableGroup>
                        </ComposableMap>
                      </div>
                    )}
                  </Motion>
                  {/* </GoogleMapReact> */}
                </div>
              </CardContent>
            </Card>
            <div style={{
              position: 'absolute',
              top: this.state.y + 60,
              left: this.state.x + 60,
              borderRadius: 15,
              borderStyle: 'line',
              borderWidth: 1,
              backgroundColor: 'transparent'
            }}>
              {info && info.id && !loading &&
                <Paper elevation={0}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell> ID </TableCell>
                        <TableCell align="right">{info.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell> Nome </TableCell>
                        <TableCell align="right">{info.name}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              }
              {loading && <div> Carregando...</div>}
            </div>
          </Grid>
          <Grid alignContent='flex-start' alignItems='flex-start'>
            <FormControl component="fieldset">
              <FormLabel component="legend">Filtros</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={this.state.showCity} onChange={(e, v) => this.setState(prev => ({ showCity: !prev.showCity }))} value="gilad" />}
                  label="Exibir Cidades"
                />
                <FormControlLabel
                  control={<Switch checked={this.state.showOngsNumber} onChange={(e, v) => this.setState(prev => ({ showOngsNumber: !prev.showOngsNumber }))} value="gilad" />}
                  label="Exibir Quantidades de Ongs"
                />
              </FormGroup>
              {this.state.showOngsNumber && <>
                <Typography gutterBottom>
                  Número de Ongs
              </Typography>
                <Slider
                  defaultValue={1}
                  getAriaValueText={(v) => `${v} ongs`}
                  step={1}
                  marks
                  min={1}
                  max={300}
                  onChange={(e, v) => {
                    return this.setState({ cityScale: scaleLinear().domain([2, 40]).range([2, v]) })
                  }}
                  valueLabelDisplay="auto"
                />
              </>}
              <FormHelperText>Be careful</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
