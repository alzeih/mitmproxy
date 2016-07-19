import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { MessageUtils } from '../flow/utils.js'
import { ViewAuto, ViewImage } from './ContentView/ContentViews'
import * as MetaViews from './ContentView/MetaViews'
import ContentLoader from './ContentView/ContentLoader'
import ViewSelector from './ContentView/ViewSelector'
import CodeEditor from './common/CodeEditor'
import {setModifiedFlowContent} from '../ducks/flows'


class ContentView extends Component {

    static propTypes = {
        // It may seem a bit weird at the first glance:
        // Every view takes the flow and the message as props, e.g.
        // <Auto flow={flow} message={flow.request}/>
        flow: React.PropTypes.object.isRequired,
        message: React.PropTypes.object.isRequired,
        onContentChange: React.PropTypes.func.isRequired
    }

    constructor(props, context) {
        super(props, context)
        this.state = { displayLarge: false, View: ViewAuto}
        this.selectView = this.selectView.bind(this)
    }

    selectView(View) {
        this.setState({ View })
    }

    displayLarge() {
        this.setState({ displayLarge: true })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.message !== this.props.message) {
            this.setState({ displayLarge: false, View: ViewAuto })
        }
    }

    isContentTooLarge(msg) {
        return msg.contentLength > 1024 * 1024 * (ViewImage.matches(msg) ? 10 : 0.2)
    }

    onOpenFile(e) {
        if (e.target.files.length > 0) {
            this.props.onContentChange(e.target.files[0])
        }
        e.preventDefault()
    }

    render() {
        const { flow, message, setModifiedFlowContent, isFlowEditorOpen } = this.props
        const { displayLarge, View } = this.state

        if (message.contentLength === 0) {
            return <MetaViews.ContentEmpty {...this.props}/>
        }

        if (message.contentLength === null) {
            return <MetaViews.ContentMissing {...this.props}/>
        }

        if (!displayLarge && this.isContentTooLarge(message)) {
            return <MetaViews.ContentTooLarge {...this.props} onClick={this.displayLarge}/>
        }

        return (
            <div>
                {isFlowEditorOpen ? (
                    <ContentLoader flow={flow} message={message}>
                        <CodeEditor content="" onChange={content =>{setModifiedFlowContent(content)}}/>
                    </ContentLoader>
                ): (<div>
                    {View.textView ? (
                        <ContentLoader  flow={flow} message={message}>
                            <this.state.View content="" />
                        </ContentLoader>
                    ) : (
                        <View flow={flow}  message={message} />
                    )}



                    <div className="view-options text-center">
                        <ViewSelector onSelectView={this.selectView} active={View} message={message}/>
                        &nbsp;
                        <a  className="btn btn-default btn-xs"
                            href={MessageUtils.getContentURL(flow, message)}
                            title="Download the content of the flow."
                        >
                            <i className="fa fa-download"/>
                        </a>
                        &nbsp;
                        <a  className="btn btn-default btn-xs"
                            href="#"
                            onClick={e => {this.fileInput.click(); e.preventDefault();}}
                            title="Upload a file to replace the content."
                        >
                            <i className="fa fa-upload"/>
                        </a>
                        <input
                            ref={ref => this.fileInput = ref}
                            className="hidden"
                            type="file"
                            onChange={e => this.onOpenFile(e)}
                        />
                    </div>
                </div>)}
            </div>
        )
    }
}
export default connect(
    state => (
        {isFlowEditorOpen : state.ui.isFlowEditorOpen}
    ), {
        setModifiedFlowContent
    })(ContentView)
