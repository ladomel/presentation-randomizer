import React, {Component} from 'react';
import MaterialTable from 'material-table';
import productService from "../services/thesisService";
import TextField from "@material-ui/core/TextField";
import {withAuth} from "@okta/okta-react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import RandomizeDialog from "./RandomizeDialog";
import Rating from '@material-ui/lab/Rating';
import StarIcon from '@material-ui/icons/Star';
// import ClearIcon from '@material-ui/icons/Clear';
// import DoneAllIcon from '@material-ui/icons/DoneAll';
// import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Badge from "@material-ui/core/Badge";
import ratingService from "../services/ratingService";

export default withAuth(class ThesesGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            dialogOpen: false,
            dummy: 666,
            loading: true
        };

        this.props.auth.getUser().then(user => {
            // console.log(user);
            this.setState({
                user: user
            });
            this.loadData();
        });
    }

    loadData = () => {
        this.setState({loading: true});
        this.props.auth.getAccessToken().then(token => {
            productService.load(token).then(json => {
                this.setState({
                    data: json,
                    loading: false
                })
            });
        });
    };

    dialogClose = () => {
        this.setState({
            dialogOpen: false
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

        this.props.auth.getAccessToken().then(token => {
            ratingService.rate(token, data).then(json => {

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
        });
    };

    render() {
        return (
            <div>
                <AppBar position="fixed" style={{height: 60}}>
                    <Toolbar>
                        <Typography variant="h6" style={{flexGrow: 1}}>Theses</Typography>
                        <Button
                            color="inherit"
                            onClick={() => this.setState({
                                dialogOpen: true
                            })}
                        >Randomize</Button>
                    </Toolbar>
                </AppBar>

                <RandomizeDialog open={this.state.dialogOpen} onClose={this.dialogClose} onRandomize={this.onRandomize}/>

                <MaterialTable
                    style={{top: 60}}
                    localization={{header: {actions: ''}}}
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
                        {field: 'totalRating', render: rowData => {
                            let count = 0, sum = 0;
                            if (rowData && rowData.ratings) {
                                for (let i of rowData.ratings) {
                                    count++;
                                    sum += i.rating;
                                }
                                rowData.totalRating = count > 0 ? (Math.round(sum/count * 10) / 10) : 0;
                            }
                            return  <Badge anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right'
                                    }} badgeContent={count > 0 ? (Math.round(sum/count * 10) / 10) : '-'} color={count > 0 && (Math.round(sum/count * 10) / 10) >= 2.5 ? "primary" : "secondary"}>
                                        <StarIcon/>
                                    </Badge>
                        }, cellStyle: {
                            width: 10
                        }, editable: false},
                        {title: 'Rating', field: 'myRating', render: rowData => {
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
                            width: 20
                        }, editComponent: props => ""},
                        {title: 'Author', field: 'author_name', editable: false, cellStyle: {
                            width: 50
                        }},
                        {field: 'author', hidden: true},
                        {title: 'Thesis', field: 'description',
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
                        {title: 'Presenter', field: 'presenter_name', editable: false, render: rowData => rowData && rowData.presenter_name ? rowData.presenter_name : "N/A", cellStyle: {
                            width: 50
                        }},
                        // {title: 'Status', field: 'status', editable: false, cellStyle: {
                        //     width: 10
                        // }, render: rowData => rowData.status === 'IN_PROGRESS' ? <HourglassEmptyIcon/> : rowData.status === 'DONE' ? <DoneAllIcon/> : rowData.status === 'FAILED' ? <ClearIcon/> : ''},
                    ]}
                    data={this.state.data}
                    editable={{
                        onRowAdd: newData =>
                            new Promise(resolve => {
                                newData['author_name'] = this.state.user.name;
                                newData['author'] = this.state.user.email;

                                this.props.auth.getAccessToken().then(token => {
                                    productService.save(token, newData).then(json => {
                                        if (json.success) {
                                            this.setState(prevState => {
                                                const data = [...prevState.data];
                                                data.push(json.thesis);
                                                return {...prevState, data};
                                            });
                                        } else {
                                            alert('Can\'t POST. HELPPPPPPP!')
                                        }
                                        resolve();
                                    });
                                });
                            }),
                        onRowUpdate: (newData, oldData) =>
                            new Promise(resolve => {
                                this.props.auth.getAccessToken().then(token => {
                                    productService.update(token, newData['_id'], newData).then(json => {
                                        if (json.success) {
                                            this.setState(prevState => {
                                                const data = [...prevState.data];
                                                data[data.indexOf(oldData)] = newData;
                                                return {...prevState, data};
                                            });
                                        } else {
                                            alert('Can\'t PUT. HELPPPPPPP!')
                                        }
                                        resolve();
                                    });
                                });
                            }),
                        onRowDelete: oldData =>
                            new Promise(resolve => {
                                this.props.auth.getAccessToken().then(token => {
                                    productService.delete(token, oldData['_id']).then(json => {
                                        if (json.success) {
                                            this.setState(prevState => {
                                                const data = [...prevState.data];
                                                data.splice(data.indexOf(oldData), 1);
                                                return {...prevState, data};
                                            });
                                        } else {
                                            alert('Can\'t DELETE. HELPPPPPPP!')
                                        }
                                        resolve();
                                    });
                                });
                            })
                    }}
                />
            </div>
        );
    }
});