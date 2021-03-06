import Form, { UiSchema, utils } from "@rjsf/core";
import { shell } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/tauri";
import { JSONSchema7 } from "json-schema";
import { useState } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import CenteredSpinner from "../../../../../Common/Spinner/CenteredSpinner";
import { EditorProps } from "../../Editor";
import CenteredMessage from "../CenteredMessage";
import InspectorBoolean from "./Fields/InspectorBoolean";
import InspectorArrayFieldTemplate from "./FieldTemplates/InspectorArrayFieldTemplate";
import InspectorFieldTemplate from "./FieldTemplates/InspectorFieldTemplate";
import InspectorObjectFieldTemplate from "./FieldTemplates/InspectorObjectFieldTemplate";

export type InspectorProps = {
    schema: JSONSchema7;
} & EditorProps;

function Inspector(props: InspectorProps) {
    const [loadStarted, setLoadStarted] = useState(false);
    const [loadDone, setLoadDone] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadFile = async (): Promise<string> => {
        return await invoke("read_file_as_string", {
            path: props.file.path
        });
    };

    if (!loadStarted) {
        setLoadStarted(true);
        if (props.file.path.startsWith("@@void@@")) {
            setLoadDone(true);
        } else {
            loadFile()
                .then((data) => {
                    props.file.data = utils.getDefaultFormState(
                        props.schema,
                        JSON.parse(data),
                        props.schema
                    );
                    setLoadDone(true);
                })
                .catch(setErrorMessage);
        }
    }

    if (props.file.data === null || !loadDone) {
        if (errorMessage) {
            return (
                <CenteredMessage
                    variant="danger"
                    message={`Failed to load file: ${errorMessage}`}
                    after={
                        <Button
                            className="mt-2 mx-auto d-flex align-items-center"
                            onClick={() => shell.open(props.file.path)}
                            variant="outline-info"
                        >
                            <BoxArrowUpRight className="me-1" />
                            Fix In External Editor
                        </Button>
                    }
                />
            );
        } else {
            return <CenteredSpinner />;
        }
    }

    const customFields = {
        BooleanField: InspectorBoolean
    };

    const uiSchema: UiSchema = {
        "ui:submitButtonOptions": {
            norender: true,
            submitText: "",
            props: {}
        }
    };

    const onChange = (newData: object) => {
        props.onChange?.();
        props.file.data = newData;
    };

    const formContext = {
        docsSchemaLink:
            props.file.fileType === "mod_manifest" ? null : props.file.getDocsSchemaLink()
    };

    return (
        <Form
            onChange={(newData) => onChange(newData.formData as object)}
            className={"mx-3 inspector-form"}
            formData={props.file.data}
            formContext={formContext}
            schema={props.schema}
            uiSchema={uiSchema}
            fields={customFields}
            ArrayFieldTemplate={InspectorArrayFieldTemplate}
            ObjectFieldTemplate={InspectorObjectFieldTemplate}
            FieldTemplate={InspectorFieldTemplate}
        />
    );
}

export default Inspector;
