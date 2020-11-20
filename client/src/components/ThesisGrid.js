import React, { Component } from 'react';
import MaterialTable from 'material-table';
import GoogleLogin from 'react-google-login';
import Cookies from 'universal-cookie';
import productService from "../services/thesisService";
import TextField from "@material-ui/core/TextField";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import RandomizeDialog from "./RandomizeDialog";
import Rating from '@material-ui/lab/Rating';
import StarIcon from '@material-ui/icons/Star';
import PersonIcon from '@material-ui/icons/Person';
import Badge from "@material-ui/core/Badge";
import ratingService from "../services/ratingService";
import { IconButton, Tooltip } from '@material-ui/core';
import AlertDialog from './AlertDialog';
import thesisService from '../services/thesisService';

export default class ThesesGrid extends Component {
    constructor(props) {
        super(props);

        this.cookies = new Cookies();
        const token = this.cookies.get('auth_token'),
            user = this.cookies.get('auth_user');

        this.state = {
            data: [],
            dialogOpen: false,
            alertOpen: false,
            dummy: 666,
            loading: true,
            authenticated: !!token,
            token: token,
            user: user
        };
    }

    componentDidMount = () => this.loadData();

    loadData = () => {
        this.setState({ loading: true });

        productService.load().then(json => {
            this.setState({
                data: json,
                loading: false
            })
        });
    };

    dialogClose = () => {
        this.setState({
            dialogOpen: false,
            alertOpen: false
        });
    };

    onRandomize = () => {
        this.loadData();
        this.setState({
            dialogOpen: false
        });
    };

    onRatingChange = (e, rating) => {
        let thesis_id = e.target.name;

        let data = {
            type: 'THESIS',
            thesis_id: thesis_id,
            user: this.state.user.email,
            rating: rating
        };

        ratingService.rate(this.state.token, data).then(json => {
            if (json.success) {
                let data = this.state.data;
                for (let j = 0; j < data.length; j++) {
                    let row = data[j];
                    if (row['_id'] === thesis_id) {
                        let edited = false;
                        if (row.ratings) {
                            for (let i = 0; i < row.ratings.length; i++) {
                                let r = row.ratings[i];
                                if (r.user === this.state.user.email) {
                                    edited = true;
                                    r.rating = rating;
                                    row.ratings[i] = r;
                                    break;
                                }
                            }
                        }
                        if (!edited) {
                            if (!row.ratings) {
                                row.ratings = [];
                            }
                            row.ratings.push(json.rating);
                        }
                        data[j] = row;
                        break;
                    }
                }

                this.setState({
                    dummy: 999
                })
            }
        });
    };

    responseGoogle = (response) => {
        console.log(response)
        if (response && response.tokenId) {
            const user = {
                email: response.profileObj.email,
                name: response.profileObj.name
            }
            this.cookies.set('auth_token', response.tokenId, { path: '/' });
            this.cookies.set('auth_user', JSON.stringify(user), { path: '/' });
            this.setState({
                token: response.tokenId,
                authenticated: true,
                user: user
            });
        } else {
            alert('Can\'t log in!!!')
        }
    }

    logout = () => {
        this.cookies.remove('auth_token');
        this.cookies.remove('auth_user');

        this.setState({
            authenticated: false,
            token: null,
            user: {}
        });
    }

    onAssignToMeClick = () => {
        const payload = {
            presenter: this.state.user.email,
            presenter_name: this.state.user.name
        }
        thesisService.update(this.state.token, this.state.selection, payload).then(json => {
            if (json.success) {
                this.loadData();
            } else {
                alert('Can\'t ASSIGN. HELPPPPPPP!')
            }
        });

        this.dialogClose();
    }

    render() {
        let editable = {
            isEditHidden: () => !this.state.authenticated,
            isDeleteHidden: () => !this.state.authenticated,
            onRowUpdate: (newData, oldData) =>
                new Promise(resolve => {
                    productService.update(this.state.token, newData['_id'], newData).then(json => {
                        if (json.success) {
                            this.setState(prevState => {
                                const data = [...prevState.data];
                                data[data.indexOf(oldData)] = newData;
                                return { ...prevState, data };
                            });
                        } else {
                            alert('Can\'t PUT. HELPPPPPPP!')
                        }
                        resolve();
                    });
                }),
            onRowDelete: oldData =>
                new Promise(resolve => {
                    productService.delete(this.state.token, oldData['_id']).then(json => {
                        if (json.success) {
                            this.setState(prevState => {
                                const data = [...prevState.data];
                                data.splice(data.indexOf(oldData), 1);
                                return { ...prevState, data };
                            });
                        } else {
                            alert('Can\'t DELETE. HELPPPPPPP!')
                        }
                        resolve();
                    });
                })
        }

        if (this.state.authenticated) {
            editable.onRowAdd = newData => 
                new Promise(resolve => {
                    productService.save(this.state.token, newData).then(json => {
                        if (json.success) {
                            this.setState(prevState => {
                                const data = [...prevState.data];
                                data.push(json.thesis);
                                return { ...prevState, data };
                            });
                        } else {
                            alert('Can\'t POST. HELPPPPPPP!')
                        }
                        resolve();
                    });
                });
        }

        
        return (
            <div>
                <AppBar position="fixed" style={{ height: 60 }}>
                    <Toolbar>
                        <Typography variant="h6" style={{ flexGrow: 1 }}>Theses</Typography>
                        {this.state.authenticated &&
                            <Button
                                color="inherit"
                                onClick={() => this.setState({
                                    dialogOpen: true
                                })}
                            >Randomize</Button>
                        }

                        {!this.state.authenticated ?
                            <GoogleLogin
                                clientId={process.env.REACT_APP_CLIENT_ID}
                                buttonText="Login"
                                onSuccess={this.responseGoogle}
                                onFailure={this.responseGoogle}
                                cookiePolicy={'single_host_origin'}
                                responseType='token'
                            /> :
                            <Button
                                color="inherit"
                                onClick={this.logout}
                            >Logout</Button>
                        }
                    </Toolbar>
                </AppBar>

                <RandomizeDialog open={this.state.dialogOpen} onClose={this.dialogClose} onRandomize={this.onRandomize} />
                <AlertDialog open={this.state.alertOpen} onDisagree={this.dialogClose} onAgree={this.onAssignToMeClick} />

                <MaterialTable
                    style={{ top: 60 }}
                    localization={{ header: { actions: '' } }}
                    options={{
                        minBodyHeight: 100,
                        exportButton: true,
                        exportDelimiter: '\t',
                        paging: false,
                        showTitle: false,
                        searchFieldAlignment: 'left',
                        addRowPosition: 'first',
                        actionsColumnIndex: 99
                    }}
                    isLoading={this.state.loading}
                    columns={[
                        {
                            field: 'totalRating', render: rowData => {
                                let count = 0, sum = 0;
                                if (rowData && rowData.ratings) {
                                    for (let i of rowData.ratings) {
                                        count++;
                                        sum += i.rating;
                                    }
                                    rowData.totalRating = count > 0 ? (Math.round(sum / count * 10) / 10) : 0;
                                }
                                return <Badge anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right'
                                }} badgeContent={count > 0 ? (Math.round(sum / count * 10) / 10) : '-'} color={count > 0 && (Math.round(sum / count * 10) / 10) >= 2.5 ? "primary" : "secondary"}>
                                    <StarIcon />
                                </Badge>
                            }, 
                            cellStyle: {
                                width: 1
                            },
                            editable: false, width: 6666666
                        },
                        {
                            title: 'Rating', field: 'myRating', hidden:!this.state.authenticated, render: rowData => {
                                let userRating = null;
                                if (rowData && rowData.ratings) {
                                    for (let i of rowData.ratings) {
                                        if (i.user === this.state.user.email) {
                                            userRating = i;
                                            break;
                                        }
                                    }
                                    rowData.myRating = userRating ? userRating.rating : 0;
                                }
                                return <Rating name={rowData && rowData['_id'] ? rowData['_id'] : 'new'} size="small" value={userRating ? userRating.rating : 0} precision={0.5} onChange={this.onRatingChange} />
                            }, cellStyle: {
                                width: 1
                            }, editComponent: props => ""
                        },
                        {
                            title: 'Author', field: 'author_name', editable: false, cellStyle: {
                                width: 200
                            }, render: rowData => <div style={{whiteSpace: 'nowrap'}}>{rowData.author_name}</div>
                        },
                        { field: 'author', hidden: true },
                        {
                            title: 'Thesis', field: 'description',
                            cellStyle: {
                                width: 66666666
                            },
                            editComponent: props => {
                                return <TextField
                                    multiline={true}
                                    defaultValue={props.rowData.description}
                                    onChange={(a) => {
                                        props.rowData.description = a.target.value;
                                    }}
                                    style={{
                                        width: '100%'
                                    }}
                                />
                            }
                        },
                        {
                            title: 'Presenter', field: 'presenter_name', editable: false, 
                            render: rowData => <div style={{whiteSpace: 'nowrap'}}>{rowData && rowData.presenter_name ? rowData.presenter_name : "N/A"}</div>, cellStyle: {
                                width: 1
                            }
                        },
                        {
                            render: rowData => 
                                <Tooltip title='Assign to me'>
                                    <IconButton color='inherit' onClick={() => this.setState({alertOpen: true, selection: rowData['_id']})}>
                                        <PersonIcon/>
                                    </IconButton>
                                </Tooltip>,
                            hidden: !this.state.authenticated
                        }
                    ]}
                    data={this.state.data}
                    editable={editable}
                />
            </div>
        );
    }
};