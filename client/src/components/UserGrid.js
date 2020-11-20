import React, {Component} from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import userService from "../services/userService";
import Cookies from 'universal-cookie';

export default class UserGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            checked: [],
            loading: true,
            token: new Cookies().get('auth_token')
        };

        userService.load(this.state.token).then(data => {
            for (let i = 0; i < data.length; i++) {
                data[i]['id'] = i;
                this.state.checked.push(true);
            }
            this.setState({
                data: data,
                loading: false
            }, this.onSelectionChange)
        });
    }

    onSelectionChange = () => {
        this.props.onSelectionChange(this.state.data.filter(item => this.state.checked[item.id]));
    };

    onItemToggle = (e, checked) => {
        let tempChecked = this.state.checked;
        tempChecked[e.target.name] = checked;
        this.setState({
            checked: tempChecked
        });
        this.onSelectionChange();
    };

    render() {
        return (
            <List style={{
                width: '100%',
                maxHeight: 200,
                overflow: 'auto'
            }}>
                {this.state.loading ? "Loading Users..." : this.state.data.length === 0 ? "No users found!" : this.state.data.map(value => {
                    return (
                        <ListItem key={value.id} button>
                            <ListItemText primary={`${value.name + " [" + value.email + "]"}`}/>
                            <ListItemSecondaryAction>
                                <Checkbox
                                    name={"" + value.id}
                                    edge="end"
                                    onChange={this.onItemToggle}
                                    defaultChecked={this.state.checked[value.id]}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    );
                })}
            </List>
        );
    }
}