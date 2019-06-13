// @flow
import React, { useState, useEffect, useCallback } from "react";
import { cloneDeep } from "lodash";
import { css } from "emotion";
import styled from "react-emotion";
import {
    Dialog,
    DialogBody,
    DialogHeader,
    DialogHeaderTitle,
    DialogCancel,
    DialogFooter,
    DialogFooterButton
} from "webiny-ui/Dialog";

import { Form } from "webiny-form";
import { getPlugins } from "webiny-plugins";
import { Tabs, Tab } from "webiny-ui/Tabs";
import { Elevation } from "webiny-ui/Elevation";
import { Typography } from "webiny-ui/Typography";
import { Icon } from "webiny-ui/Icon";
import GeneralTab from "./GeneralTab";
import ValidatorsTab from "./ValidatorsTab";

import { i18n } from "webiny-app/i18n";
const t = i18n.namespace("FormEditor.EditFieldDialog");

const dialogBody = css({
    "&.mdc-dialog__body": {
        marginTop: 0,
        padding: "0"
    }
});

const FieldTypeList = styled("div")({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    paddingTop: 25,
    backgroundColor: "var(--mdc-theme-background) !important"
});

const fieldTypeBox = css({
    width: 150,
    height: 150,
    textAlign: "center",
    margin: 20,
    padding: 15,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    cursor: "pointer",
    transition: "opacity 225ms",
    flexDirection: "column",
    backgroundColor: "var(--mdc-theme-surface) !important",
    ".webiny-ui-icon": {
        color: "var(--mdc-theme-secondary)",
        height: 50,
        transition: "color 225ms"
    },
    "&:hover": {
        opacity: 0.8,
        ".webiny-ui-icon": {
            color: "var(--mdc-theme-primary)"
        }
    }
});

const Thumbnail = ({ fieldType, onClick }) => {
    return (
        <Elevation z={2} onClick={onClick} className={fieldTypeBox}>
            <Icon icon={fieldType.icon} />
            <Typography use={"headline5"}>{fieldType.label}</Typography>
            <br />
            <Typography use={"caption"}>{fieldType.description}</Typography>
        </Elevation>
    );
};

type Props = {
    field: ?Object,
    onClose: Function,
    onSubmit: Function
};

const EditFieldDialog = ({ field, onSubmit, ...props }: Props) => {
    // const fieldType = getFieldType();
    const [current, setCurrent] = useState(null);

    useEffect(() => {
        setCurrent(cloneDeep(field));
    }, [field]);

    const onClose = useCallback(() => {
        setCurrent(null);
        props.onClose();
    });

    return (
        <Dialog open={!!current} onClose={onClose}>
            <DialogHeader>
                <DialogHeaderTitle>{t`Field Settings`}</DialogHeaderTitle>
            </DialogHeader>

            {current &&
                (current.type ? (
                    <Form submitOnEnter data={current} onSubmit={onSubmit}>
                        {form => {
                            const { Bind } = form;
                            return (
                                <>
                                    <DialogBody className={dialogBody}>
                                        <Tabs>
                                            <Tab label={t`General`}>
                                                <GeneralTab form={form} field={current} />
                                            </Tab>
                                            {!!current.validators && (
                                                <Tab label={"Validators"}>
                                                    <Bind name={"validation"}>
                                                        <ValidatorsTab
                                                            form={form}
                                                            field={current}
                                                        />
                                                    </Bind>
                                                </Tab>
                                            )}
                                        </Tabs>
                                    </DialogBody>
                                    <DialogFooter>
                                        <DialogFooterButton onClick={onClose}>
                                            {t`Cancel`}
                                        </DialogFooterButton>
                                        <DialogFooterButton onClick={form.submit}>
                                            {t`Save`}
                                        </DialogFooterButton>
                                    </DialogFooter>
                                </>
                            );
                        }}
                    </Form>
                ) : (
                    <>
                        <DialogBody className={dialogBody}>
                            <FieldTypeList>
                                {getPlugins("form-editor-field-type")
                                    .filter(pl => pl.fieldType.dataType)
                                    .map(pl => (
                                        <Thumbnail
                                            key={pl.name}
                                            fieldType={pl.fieldType}
                                            onClick={() => setCurrent(pl.fieldType.createField())}
                                        />
                                    ))}
                            </FieldTypeList>
                        </DialogBody>
                        <DialogFooter>
                            <DialogCancel onClick={onClose}>{t`Cancel`}</DialogCancel>
                        </DialogFooter>
                    </>
                ))}
        </Dialog>
    );
};

export default EditFieldDialog;
