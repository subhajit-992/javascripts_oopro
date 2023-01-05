class DOMHelper {
    static clearEventListeners(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }
    
    
    static moveElement(elementId,newDestinationSelector) {
       const element = document.getElementById(elementId);
       const destinationElement = document.querySelector(newDestinationSelector);
       destinationElement.append(element); 
    }
}

class Component{
    constructor(hostElementId,insertBefore = false) {
        if(hostElementId) {
            this.hostElement = document.getElementById(hostElementId);
        } else{
            this.hostElement = document.body;
        }
        this.insertBefore = insertBefore
    }


    detach() {
        if(this.element) {
            this.element.remove();
        }
    }

    
        
    attach() {
        this.hostElement.insertAdjacentElement(this.insertBefore ? 'afterbegin' : 'beforeend',this.element);
    }
}



class Tooltip extends Component {
    constructor(closeNotifierFunction) {
        super();
        this.closeNotifier = closeNotifierFunction;
        this.create();
    }


    closeTooltip = () => {
        this.detach();
        this.closeNotifier();
    };

    create() {
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'card';
        tooltipElement.textContent = 'DUMMY';
        tooltipElement.addEventListener('click',this.closeTooltip);
        this.element = tooltipElement; 
    }


    
}

class ProjectItem {
    hasActiveTooltip = false;

    constructor(id,updateProjectListsFunction,type) {
        this.id = id;
        this.updateProjectListsHandler = updateProjectListsFunction;
        this.connectMoreInfoButton();
        this.connectSwitchButton(type);
    }


    showMoreInfoHandler() {
        if(this.hasActiveTooltip){
            return;
        }
        const tooltip = new Tooltip(() => {
            this.hasActiveTooltip = false;
        });
        tooltip.attach();
        this.hasActiveTooltip = true;
    }

    connectMoreInfoButton() {
        const ProjectItemElement = document.getElementById(this.id);
        const moreInfoBtn = ProjectItemElement.querySelector('button:first-of-type');
        moreInfoBtn.addEventListener('click',this.showMoreInfoHandler)
    }

    connectSwitchButton(type) {
        const ProjectItemElement = document.getElementById(this.id);
        let SwitchBtn = ProjectItemElement.querySelector('button:last-of-type');
        SwitchBtn = DOMHelper.clearEventListeners(SwitchBtn);
        SwitchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';
        SwitchBtn.addEventListener('click',this.updateProjectListsHandler.bind(null,this.id))
    }

    update(updateProjectListsFn, type) {
        this.updateProjectListsHandler = updateProjectListsFn;
        this.connectSwitchButton(type);
    }
}

class ProjectList {
    Projects = [];


    constructor(type) {
        this.type = type;
        const PrjItems = document.querySelectorAll(`#${type}-projects li`);
        for (const PrjItem of PrjItems) {
            this.Projects.push(new ProjectItem(PrjItem.id,this.SwitchProject.bind(this),this.type));
        }
        console.log(this.Projects);
    }

    setSwitchHandlerFunction(SwitchHandlerFunction){
        this.SwitchHandler = SwitchHandlerFunction
    }

    addproject(project) {
        this.Projects.push(project);
        DOMHelper.moveElement(project.id,`#${this.type}-projects ul`);
        project.update(this.SwitchProject.bind(this), this.type);
    }

    SwitchProject(ProjectId) {
        //const |ProjectIndex = this.Projects.findIndex(p => p.id === ProjectId);
        //this.Projects.splice(ProjectIndex, 1);
        this.SwitchHandler(this.Projects.find(p => p.id === ProjectId));
        this.Projects = this.Projects.filter(p => p.id !== ProjectId);
    }
}

class App {
    static init() {
        const activeProjectList = new ProjectList('active');
        const finishedProjectList = new ProjectList('finished');
        activeProjectList.setSwitchHandlerFunction(
            finishedProjectList.addproject.bind(finishedProjectList)
        );

        finishedProjectList.setSwitchHandlerFunction(
            activeProjectList.addproject.bind(activeProjectList)
        );
    }
}

App.init();