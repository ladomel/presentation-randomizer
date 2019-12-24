import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import UserGrid from "./UserGrid";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import randomizeService from "../services/randomizeService";
import {withAuth} from "@okta/okta-react";

export default withAuth(class RandomizeDialog extends Component {
    constructor(props) {
       super(props);

       this.state = {
           users: [],
           loading: false
       }
    }

    randomize = () => {
        this.setState({
            loading: true
        });

        let data = {
            users: this.state.users
        };

        this.props.auth.getAccessToken().then(token =>
            randomizeService.randomize(token, data).then(json => {
                if (json.success) {
                    this.props.onRandomize();
                    this.setState({
                        loading: false
                    });
                }
            }
        ));
    };

    handleCancel = () => {
        this.props.onClose();
    };

    onSelectionChange = (selected) => {
        this.setState({
            users: selected
        })
    };

    render() {
        return (
            <Dialog hideBackdrop={false} open={this.props.open}>
                <DialogTitle>Randomize Theses</DialogTitle>
                <DialogContent dividers style={{
                    width: 400
                }}>
                    <DialogContentText>
                        Please select users to Randomize
                    </DialogContentText>
                    <UserGrid onSelectionChange={this.onSelectionChange}/>
                </DialogContent>
                <DialogActions>
                    <span hidden={!this.state.loading}>Please Wait...</span>
                    <Button autoFocus onClick={this.handleCancel} disabled={this.state.loading} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.randomize} disabled={this.state.users.length === 0 || this.state.loading} color="secondary">
                        Randomize
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
});

// RandomizeDialog.propTypes = {
//     onClose: PropTypes.func.isRequired,
//     open: PropTypes.bool.isRequired,
// }

